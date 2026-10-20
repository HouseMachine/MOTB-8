import { createPublicKey, verify } from "node:crypto";

import canonicalize from "canonicalize";

import { parseMotb8Tag } from "../tag/parse.js";
import { verifyGenesisRecord } from "../genesis/verify.js";
import type { GenesisRecord } from "../genesis/create.js";
import type { MOTB8BeaconV01 } from "./types.js";
import type { MOTB8BeaconV11 } from "./types-v1.1.js";
import { validateBeaconStructure } from "./validate.js";
import { generateDiscoverySummary } from "./summary.js";

export interface BeaconVerificationResult {
  valid: boolean;
  genesisStatus: string;
  reason: string;
}

export function verifyBeacon(
  beaconInput: unknown,
  genesisInput: unknown
): BeaconVerificationResult {
  if (!validateBeaconStructure(beaconInput)) {
    return {
      valid: false,
      genesisStatus: "UNRESOLVED",
      reason: "Beacon schema validation failed"
    };
  }

  const beacon = beaconInput as MOTB8BeaconV01 | MOTB8BeaconV11;
  const genesisResult = verifyGenesisRecord(genesisInput);

  if (genesisResult.status === "INVALID") {
    return {
      valid: false,
      genesisStatus: "INVALID",
      reason: "Genesis verification failed"
    };
  }

  if (genesisResult.status !== "VALID_UNANCHORED") {
    return {
      valid: false,
      genesisStatus: genesisResult.status,
      reason: "Genesis binding could not be established"
    };
  }

  const genesis = genesisInput as GenesisRecord;

  try {
    parseMotb8Tag(beacon.motb8Tag);

    const expectedSummary = generateDiscoverySummary(beacon);

    if (beacon.discoverySummary !== expectedSummary) {
      throw new Error("Beacon discovery summary mismatch");
    }

    if (beacon.motb8Tag !== genesis.motb8Tag) {
      throw new Error("Beacon and Genesis Tag mismatch");
    }

    if (
      beacon.controller.id !== genesis.controller.id ||
      beacon.controller.publicKeyJwk.x !== genesis.controller.publicKeyJwk.x
    ) {
      throw new Error("Beacon controller does not match Genesis");
    }

    const publicKey = createPublicKey({
      key: beacon.controller.publicKeyJwk,
      format: "jwk"
    });

    const { proof, ...unsigned } = beacon;
    const canonical = canonicalize(unsigned);

    if (typeof canonical !== "string") {
      throw new Error("Beacon canonicalization failed");
    }

    const signatureValid = verify(
      null,
      Buffer.from(canonical, "utf8"),
      publicKey,
      Buffer.from(proof.signature, "base64url")
    );

    if (!signatureValid) {
      throw new Error("Beacon signature invalid");
    }

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
