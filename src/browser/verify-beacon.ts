import canonicalize from "canonicalize";
import type { GenesisRecord } from "../genesis/create.js";
import type { MOTB8BeaconV01 } from "../beacon/types.js";
import type { MOTB8BeaconV11 } from "../beacon/types-v1.1.js";
import type { BeaconVerificationResult } from "../beacon/verify.js";
import { generateDiscoverySummary } from "../beacon/summary.js";
import { validateBrowserBeaconStructure } from "./validate.js";
import { verifyBrowserGenesisRecord } from "./verify-genesis.js";
import { isValidBrowserMotb8Tag } from "./tag.js";

function decodeBase64Url(value: string): Uint8Array {
  const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

export async function verifyBrowserBeacon(
  beaconInput: unknown,
  genesisInput: unknown
): Promise<BeaconVerificationResult> {
  if (!validateBrowserBeaconStructure(beaconInput)) {
    return { valid: false, genesisStatus: "UNRESOLVED", reason: "Beacon schema validation failed" };
  }

  const beacon = beaconInput as MOTB8BeaconV01 | MOTB8BeaconV11;
  const genesisResult = await verifyBrowserGenesisRecord(genesisInput);

  if (genesisResult.status === "INVALID") {
    return { valid: false, genesisStatus: "INVALID", reason: "Genesis verification failed" };
  }
  if (genesisResult.status !== "VALID_UNANCHORED") {
    return { valid: false, genesisStatus: genesisResult.status, reason: "Genesis binding could not be established" };
  }

  const genesis = genesisInput as GenesisRecord;
  try {
    if (!(await isValidBrowserMotb8Tag(beacon.motb8Tag))) {
      throw new Error("Invalid MOTB-8 Tag");
    }
    if (beacon.discoverySummary !== generateDiscoverySummary(beacon)) {
      throw new Error("Beacon discovery summary mismatch");
    }
    if (beacon.motb8Tag !== genesis.motb8Tag) {
      throw new Error("Beacon and Genesis Tag mismatch");
    }
    if (beacon.controller.id !== genesis.controller.id ||
        beacon.controller.publicKeyJwk.x !== genesis.controller.publicKeyJwk.x) {
      throw new Error("Beacon controller does not match Genesis");
    }

    const publicKey = await crypto.subtle.importKey(
      "jwk", beacon.controller.publicKeyJwk, "Ed25519", false, ["verify"]
    );
    const { proof, ...unsigned } = beacon;
    const canonical = canonicalize(unsigned);
    if (typeof canonical !== "string") {
      throw new Error("Beacon canonicalization failed");
    }
    const signatureValid = await crypto.subtle.verify(
      "Ed25519", publicKey,
      toArrayBuffer(decodeBase64Url(proof.signature)),
      toArrayBuffer(new TextEncoder().encode(canonical))
    );
    if (!signatureValid) throw new Error("Beacon signature invalid");

    return {
      valid: true,
      genesisStatus: genesisResult.status,
      reason: "Beacon signature valid under unanchored Genesis controller binding"
    };
  } catch (error) {
    return {
      valid: false,
      genesisStatus: genesisResult.status,
      reason: error instanceof Error ? error.message : "Beacon verification failed"
    };
  }
}
