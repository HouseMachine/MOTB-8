import canonicalize from "canonicalize";
import { controlFileV10 } from "./generated/beacon-validators.cjs";
import { scryptAsync } from "@noble/hashes/scrypt.js";

import type { EncryptedControlFile } from "../control/encrypt.js";
import type { BrowserControllerKeyPair } from "./controller.js";
import { isValidBrowserMotb8Tag } from "./tag.js";

const encoder = new TextEncoder();

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value: string): Uint8Array {
  const binary = atob(
    value.replace(/-/g, "+").replace(/_/g, "/")
  );
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function encodeAAD(metadata: object): Uint8Array {
  const canonical = canonicalize(metadata);
  if (typeof canonical !== "string") {
    throw new Error("Control File metadata canonicalization failed");
  }
  return encoder.encode(canonical);
}

async function deriveKey(
  passphrase: string,
  salt: Uint8Array
): Promise<Uint8Array> {
  return scryptAsync(encoder.encode(passphrase), salt, {
    N: 32768,
    r: 8,
    p: 1,
    dkLen: 32
  });
}

export async function encryptBrowserControlFile(
  motb8Tag: string,
  controller: BrowserControllerKeyPair,
  passphrase: string
): Promise<EncryptedControlFile> {
  if (!(await isValidBrowserMotb8Tag(motb8Tag))) {
    throw new Error("Invalid MOTB-8 Tag");
  }

  if (typeof passphrase !== "string" || passphrase.length < 12) {
    throw new Error("Control File passphrase must contain at least 12 characters");
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const nonce = crypto.getRandomValues(new Uint8Array(12));

  const metadata = {
    format: "MOTB-8-CONTROL" as const,
    version: "1.0" as const,
    motb8Tag,
    kdf: {
      algorithm: "scrypt" as const,
      N: 32768 as const,
      r: 8 as const,
      p: 1 as const,
      salt: encodeBase64Url(salt)
    },
    encryption: {
      algorithm: "AES-256-GCM" as const,
      nonce: encodeBase64Url(nonce)
    }
  };

  const derived = await deriveKey(passphrase, salt);
  let privateKeyDer: Uint8Array | undefined;

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      toArrayBuffer(derived),
      "AES-GCM",
      false,
      ["encrypt"]
    );

    privateKeyDer = new Uint8Array(
      await crypto.subtle.exportKey("pkcs8", controller.privateKey)
    );

    const encrypted = new Uint8Array(
      await crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: toArrayBuffer(nonce),
          additionalData: toArrayBuffer(encodeAAD(metadata)),
          tagLength: 128
        },
        key,
        toArrayBuffer(privateKeyDer)
      )
    );

    const ciphertext = encrypted.subarray(0, encrypted.length - 16);
    const authTag = encrypted.subarray(encrypted.length - 16);

    const controlFile = {
      ...metadata,
      encryption: {
        ...metadata.encryption,
        authTag: encodeBase64Url(authTag)
      },
      ciphertext: encodeBase64Url(ciphertext)
    };

    if (!controlFileV10(controlFile)) {
      throw new Error("Generated Control File failed schema validation");
    }

    return controlFile;
  } finally {
    privateKeyDer?.fill(0);
    derived.fill(0);
  }
}

export async function decryptBrowserControlFile(
  file: EncryptedControlFile,
  passphrase: string
): Promise<CryptoKey> {
  if (
    !controlFileV10(file) ||
    !(await isValidBrowserMotb8Tag(file.motb8Tag))
  ) {
    throw new Error("Invalid Control File structure");
  }

  if (typeof passphrase !== "string") {
    throw new Error("Invalid Control File passphrase");
  }

  const salt = decodeBase64Url(file.kdf.salt);
  const nonce = decodeBase64Url(file.encryption.nonce);
  const authTag = decodeBase64Url(file.encryption.authTag);
  const ciphertext = decodeBase64Url(file.ciphertext);

  if (
    salt.length !== 16 ||
    nonce.length !== 12 ||
    authTag.length !== 16 ||
    ciphertext.length === 0
  ) {
    throw new Error("Invalid Control File binary parameters");
  }

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

  const derived = await deriveKey(passphrase, salt);
  let plaintext: Uint8Array | undefined;

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      toArrayBuffer(derived),
      "AES-GCM",
      false,
      ["decrypt"]
    );

    const combined = new Uint8Array(ciphertext.length + authTag.length);
    combined.set(ciphertext);
    combined.set(authTag, ciphertext.length);

    plaintext = new Uint8Array(
      await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: toArrayBuffer(nonce),
          additionalData: toArrayBuffer(encodeAAD(metadata)),
          tagLength: 128
        },
        key,
        toArrayBuffer(combined)
      )
    );

    const privateKey = await crypto.subtle.importKey(
      "pkcs8",
      toArrayBuffer(plaintext),
      "Ed25519",
      false,
      ["sign"]
    );

    return privateKey;
  } finally {
    plaintext?.fill(0);
    derived.fill(0);
  }
}
