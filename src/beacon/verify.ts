import { createPublicKey, verify } from "node:crypto";
import { readFileSync } from "node:fs";
import canonicalize from "canonicalize";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import { parseMotb8Tag } from "../tag/parse.js";
import { verifyGenesisRecord } from "../genesis/verify.js";
import type { GenesisRecord } from "../genesis/create.js";
import type { MOTB8BeaconV01 } from "./types.js";

export interface BeaconVerificationResult {
  valid: boolean;
  genesisStatus: string;
  reason: string;
}

const schema = JSON.parse(
  readFileSync(
    new URL("../../schemas/beacon.schema.json", import.meta.url),
    "utf8"
  ).replace(/^\uFEFF/, "")
) as object;

const AjvConstructor = Ajv2020.default;
const ajv = new AjvConstructor({ allErrors: true });
addFormats.default(ajv);
const validateSchema = ajv.compile(schema);

export function verifyBeacon(
  beaconInput: unknown,
  genesisInput: unknown
): BeaconVerificationResult {
  if (!validateSchema(beaconInput)) {
    return {
      valid: false,
      genesisStatus: "UNRESOLVED",
      reason: "Beacon schema validation failed"
    };
  }

  const beacon = beaconInput as MOTB8BeaconV01;
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
