import canonicalize from "canonicalize";
import { genesisV10 } from "./generated/beacon-validators.cjs";
import { isValidBrowserMotb8Tag } from "./tag.js";

import type { GenesisRecord } from "../genesis/create.js";
import type { GenesisVerificationResult } from "../genesis/verify.js";

function decodeBase64Url(value: string): Uint8Array {
  const binary = atob(
    value.replace(/-/g, "+").replace(/_/g, "/")
  );

  return Uint8Array.from(
    binary,
    (character) => character.charCodeAt(0)
  );
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

export async function verifyBrowserGenesisRecord(
  input: unknown
): Promise<GenesisVerificationResult> {
  if (!genesisV10(input)) {
    return {
      status: "INVALID",
      reason: "Genesis schema validation failed"
    };
  }

  const genesis = input as GenesisRecord;

  try {
    if (!(await isValidBrowserMotb8Tag(genesis.motb8Tag))) {
      throw new Error("Invalid MOTB-8 Tag");
    }

    const publicKey = await crypto.subtle.importKey(
      "jwk",
      genesis.controller.publicKeyJwk,
      "Ed25519",
      false,
      ["verify"]
    );

    const { proof, ...unsigned } = genesis;
    const canonical = canonicalize(unsigned);

    if (typeof canonical !== "string") {
      throw new Error("Genesis canonicalization failed");
    }

    const valid = await crypto.subtle.verify(
      "Ed25519",
      publicKey,
      toArrayBuffer(decodeBase64Url(proof.signature)),
      toArrayBuffer(new TextEncoder().encode(canonical))
    );

    if (!valid) {
      return {
        status: "INVALID",
        reason: "Genesis signature verification failed"
      };
    }

    return {
      status: "VALID_UNANCHORED",
      reason:
        "Valid self-signed Genesis; independent controller binding not established"
    };
  } catch {
    return {
      status: "INVALID",
      reason: "Genesis cryptographic verification failed"
    };
  }
}
