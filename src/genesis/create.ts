import { sign, type KeyObject } from "node:crypto";
import canonicalize from "canonicalize";
import { parseMotb8Tag } from "../tag/parse.js";

export interface GenesisRecord {
  schemaVersion: "1.0";
  motb8Tag: string;
  createdAt: string;
  controller: {
    id: "#controller-1";
    type: "Ed25519";
    publicKeyJwk: {
      kty: "OKP";
      crv: "Ed25519";
      x: string;
    };
  };
  proof: {
    type: "Ed25519Signature2026";
    verificationMethod: "#controller-1";
    canonicalization: "RFC8785-JCS";
    signature: string;
  };
}

export function createGenesisRecord(
  motb8Tag: string,
  publicKeyJwk: GenesisRecord["controller"]["publicKeyJwk"],
  privateKey: KeyObject
): GenesisRecord {
  parseMotb8Tag(motb8Tag);

  if (
    publicKeyJwk.kty !== "OKP" ||
    publicKeyJwk.crv !== "Ed25519" ||
    !/^[A-Za-z0-9_-]{43}$/.test(publicKeyJwk.x)
  ) {
    throw new Error("Invalid Genesis controller public key");
  }

  if (privateKey.asymmetricKeyType !== "ed25519") {
    throw new Error("Genesis requires an Ed25519 private key");
  }

  const derivedPublicKey = privateKey
    .export({ format: "jwk" });

  if (derivedPublicKey.x !== publicKeyJwk.x) {
    throw new Error("Controller public/private key mismatch");
  }

  const unsigned = {
    schemaVersion: "1.0" as const,
    motb8Tag,
    createdAt: new Date().toISOString(),
    controller: {
      id: "#controller-1" as const,
      type: "Ed25519" as const,
      publicKeyJwk
    }
  };

  const canonical = canonicalize(unsigned);

  if (typeof canonical !== "string") {
    throw new Error("Genesis canonicalization failed");
  }

  const signature = sign(
    null,
    Buffer.from(canonical, "utf8"),
    privateKey
  ).toString("base64url");

  return {
    ...unsigned,
    proof: {
      type: "Ed25519Signature2026",
      verificationMethod: "#controller-1",
      canonicalization: "RFC8785-JCS",
      signature
    }
  };
}
