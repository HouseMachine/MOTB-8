import { generateKeyPairSync, type KeyObject } from "node:crypto";

export interface ControllerKeyPair {
  publicKey: KeyObject;
  privateKey: KeyObject;
  publicKeyJwk: {
    kty: "OKP";
    crv: "Ed25519";
    x: string;
  };
}

export function generateControllerKeyPair(): ControllerKeyPair {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const jwk = publicKey.export({ format: "jwk" });

  if (
    jwk.kty !== "OKP" ||
    jwk.crv !== "Ed25519" ||
    typeof jwk.x !== "string"
  ) {
    throw new Error("Invalid Ed25519 public key export");
  }

  return {
    publicKey,
    privateKey,
    publicKeyJwk: {
      kty: "OKP",
      crv: "Ed25519",
      x: jwk.x,
    },
  };
}
