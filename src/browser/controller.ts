export interface BrowserControllerKeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  publicKeyJwk: {
    kty: "OKP";
    crv: "Ed25519";
    x: string;
  };
}

export async function generateBrowserControllerKeyPair():
  Promise<BrowserControllerKeyPair> {
  const generated = await crypto.subtle.generateKey(
    "Ed25519",
    true,
    ["sign", "verify"]
  );

  if (!("publicKey" in generated) || !("privateKey" in generated)) {
    throw new Error("Ed25519 keypair generation failed");
  }

  const keyPair = generated;

  const jwk = await crypto.subtle.exportKey(
    "jwk",
    keyPair.publicKey
  );

  if (
    jwk.kty !== "OKP" ||
    jwk.crv !== "Ed25519" ||
    typeof jwk.x !== "string" ||
    !/^[A-Za-z0-9_-]{43}$/.test(jwk.x)
  ) {
    throw new Error("Invalid Ed25519 controller public key");
  }

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
    publicKeyJwk: {
      kty: "OKP",
      crv: "Ed25519",
      x: jwk.x,
    },
  };
}
