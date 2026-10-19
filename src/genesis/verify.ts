import { createPublicKey, verify } from "node:crypto";
import { readFileSync } from "node:fs";
import canonicalize from "canonicalize";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { parseMotb8Tag } from "../tag/parse.js";
import type { GenesisRecord } from "./create.js";

export type GenesisVerificationStatus =
  | "VALID_UNANCHORED"
  | "VALID_ANCHORED"
  | "CONFLICTING"
  | "INVALID"
  | "UNRESOLVED";

export interface GenesisVerificationResult {
  status: GenesisVerificationStatus;
  reason: string;
}

const schema = JSON.parse(
  readFileSync(
    new URL("../../schemas/genesis.schema.json", import.meta.url),
    "utf8"
  ).replace(/^\uFEFF/, "")
) as object;

const AjvConstructor = Ajv2020.default;
const ajv = new AjvConstructor({ allErrors: true });
addFormats.default(ajv);
const validateSchema = ajv.compile(schema);

export function verifyGenesisRecord(
  record: unknown
): GenesisVerificationResult {
  if (!validateSchema(record)) {
    return {
      status: "INVALID",
      reason: "Genesis schema validation failed"
    };
  }

  const genesis = record as GenesisRecord;

  try {
    parseMotb8Tag(genesis.motb8Tag);

    const publicKey = createPublicKey({
      key: genesis.controller.publicKeyJwk,
      format: "jwk"
    });

    const { proof, ...unsigned } = genesis;
    const canonical = canonicalize(unsigned);

    if (typeof canonical !== "string") {
      throw new Error("Canonicalization failed");
    }

    const valid = verify(
      null,
      Buffer.from(canonical, "utf8"),
      publicKey,
      Buffer.from(proof.signature, "base64url")
    );

    if (!valid) {
      return {
        status: "INVALID",
        reason: "Genesis signature verification failed"
      };
    }

    return {
      status: "VALID_UNANCHORED",
      reason: "Valid self-signed Genesis; independent controller binding not established"
    };
  } catch {
    return {
      status: "INVALID",
      reason: "Genesis cryptographic verification failed"
    };
  }
}

