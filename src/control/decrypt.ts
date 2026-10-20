import {
  createDecipheriv,
  createPrivateKey,
  scryptSync,
  type KeyObject
} from "node:crypto";

import { validateControlFileStructure } from "./validate.js";
import { encodeControlFileAAD } from "./aad.js";
import type { EncryptedControlFile } from "./encrypt.js";

export function decryptControlFile(
  input: unknown,
  passphrase: string
): KeyObject {
  if (!validateControlFileStructure(input)) {
    throw new Error("Invalid Control File structure");
  }

  if (typeof passphrase !== "string") {
    throw new Error("Invalid Control File passphrase");
  }

  const file = input as EncryptedControlFile;

  const salt = Buffer.from(file.kdf.salt, "base64url");
  const nonce = Buffer.from(file.encryption.nonce, "base64url");
  const authTag = Buffer.from(file.encryption.authTag, "base64url");
  const ciphertext = Buffer.from(file.ciphertext, "base64url");

  if (salt.length !== 16 || nonce.length !== 12 ||
      authTag.length !== 16 || ciphertext.length === 0) {
    throw new Error("Invalid Control File binary parameters");
  }

  const key = scryptSync(passphrase, salt, 32, {
    N: 32768,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024
  });

  const metadata = {
    format: file.format,
    version: file.version,
    motb8Tag: file.motb8Tag,
    kdf: file.kdf,
    encryption: {
      algorithm: file.encryption.algorithm,
      nonce: file.encryption.nonce
    }
  };

  let plaintext: Buffer | undefined;

  try {
    const decipher = createDecipheriv("aes-256-gcm", key, nonce);
    decipher.setAAD(encodeControlFileAAD(metadata));
    decipher.setAuthTag(authTag);

    plaintext = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()
    ]);

    const privateKey = createPrivateKey({
      key: plaintext,
      format: "der",
      type: "pkcs8"
    });

    if (privateKey.asymmetricKeyType !== "ed25519") {
      throw new Error("Recovered key is not Ed25519");
    }

    return privateKey;
  } finally {
    plaintext?.fill(0);
    key.fill(0);
  }
}