import type { GenesisRecord } from "../genesis/create.js";
import type { EncryptedControlFile } from "../control/encrypt.js";

import { verifyBrowserGenesisRecord } from "./verify-genesis.js";
import { decryptBrowserControlFile } from "./control.js";

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

export async function unlockBrowserControlFile(
  file: EncryptedControlFile,
  passphrase: string,
  genesis: GenesisRecord
): Promise<CryptoKey> {
  const verification = await verifyBrowserGenesisRecord(genesis);

  if (verification.status !== "VALID_UNANCHORED") {
    throw new Error("Genesis verification failed or unsupported");
  }

  if (file.motb8Tag !== genesis.motb8Tag) {
    throw new Error("Control File and Genesis Tag mismatch");
  }

  const privateKey = await decryptBrowserControlFile(
    file,
    passphrase
  );

  const publicKey = await crypto.subtle.importKey(
    "jwk",
    genesis.controller.publicKeyJwk,
    "Ed25519",
    false,
    ["verify"]
  );

  const challenge = crypto.getRandomValues(new Uint8Array(32));

  const signature = await crypto.subtle.sign(
    "Ed25519",
    privateKey,
    toArrayBuffer(challenge)
  );

  const matches = await crypto.subtle.verify(
    "Ed25519",
    publicKey,
    signature,
    toArrayBuffer(challenge)
  );

  if (!matches) {
    throw new Error("Recovered controller does not match Genesis");
  }

  return privateKey;
}
