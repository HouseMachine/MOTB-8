import canonicalize from "canonicalize";

import type { GenesisRecord } from "../genesis/create.js";
import type { BrowserControllerKeyPair } from "./controller.js";
import { isValidBrowserMotb8Tag } from "./tag.js";

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export async function createBrowserGenesisRecord(
  motb8Tag: string,
  controller: BrowserControllerKeyPair,
  createdAt: string = new Date().toISOString()
): Promise<GenesisRecord> {
  if (!(await isValidBrowserMotb8Tag(motb8Tag))) {
    throw new Error("Invalid MOTB-8 Tag");
  }

  const privateJwk = await crypto.subtle.exportKey(
    "jwk",
    controller.privateKey
  );

  if (privateJwk.x !== controller.publicKeyJwk.x) {
    throw new Error("Controller public/private key mismatch");
  }

  const unsigned = {
    schemaVersion: "1.0" as const,
    motb8Tag,
    createdAt,
    controller: {
      id: "#controller-1" as const,
      type: "Ed25519" as const,
      publicKeyJwk: controller.publicKeyJwk
    }
  };

  const canonical = canonicalize(unsigned);

  if (typeof canonical !== "string") {
    throw new Error("Genesis canonicalization failed");
  }

  const signature = new Uint8Array(
    await crypto.subtle.sign(
      "Ed25519",
      controller.privateKey,
      new TextEncoder().encode(canonical)
    )
  );

  return {
    ...unsigned,
    proof: {
      type: "Ed25519Signature2026",
      verificationMethod: "#controller-1",
      canonicalization: "RFC8785-JCS",
      signature: encodeBase64Url(signature)
    }
  };
}
