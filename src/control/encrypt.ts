import {
  createCipheriv,
  randomBytes,
  scryptSync,
  type KeyObject
} from "node:crypto";

import { parseMotb8Tag } from "../tag/parse.js";
import { encodeControlFileAAD } from "./aad.js";

export interface EncryptedControlFile {
  format: "MOTB-8-CONTROL";
  version: "1.0";
  motb8Tag: string;
  kdf: {
    algorithm: "scrypt";
    N: 32768;
    r: 8;
    p: 1;
    salt: string;
  };
  encryption: {
    algorithm: "AES-256-GCM";
    nonce: string;
    authTag: string;
  };
  ciphertext: string;
}

export function encryptControlFile(
  motb8Tag: string,
  privateKey: KeyObject,
  passphrase: string
): EncryptedControlFile {
  parseMotb8Tag(motb8Tag);

  if (privateKey.type !== "private" ||
      privateKey.asymmetricKeyType !== "ed25519") {
    throw new Error("Control File requires an Ed25519 private key");
  }

  if (typeof passphrase !== "string" || passphrase.length < 12) {
    throw new Error("Control File passphrase must contain at least 12 characters");
  }

  const salt = randomBytes(16);
  const nonce = randomBytes(12);

  const metadata = {
    format: "MOTB-8-CONTROL" as const,
    version: "1.0" as const,
    motb8Tag,
    kdf: {
      algorithm: "scrypt" as const,
      N: 32768 as const,
      r: 8 as const,
      p: 1 as const,
      salt: salt.toString("base64url")
    },
    encryption: {
      algorithm: "AES-256-GCM" as const,
      nonce: nonce.toString("base64url")
    }
  };

  const key = scryptSync(passphrase, salt, 32, {
    N: 32768,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024
  });

  let privateKeyDer: Buffer | undefined;

  try {
    const cipher = createCipheriv("aes-256-gcm", key, nonce);
    cipher.setAAD(encodeControlFileAAD(metadata));

    privateKeyDer = privateKey.export({
      format: "der",
      type: "pkcs8"
    });

    const ciphertext = Buffer.concat([
      cipher.update(privateKeyDer),
      cipher.final()
    ]);

    return {
      ...metadata,
      encryption: {
        ...metadata.encryption,
        authTag: cipher.getAuthTag().toString("base64url")
      },
      ciphertext: ciphertext.toString("base64url")
    };
  } finally {
    privateKeyDer?.fill(0);
    key.fill(0);
  }
}