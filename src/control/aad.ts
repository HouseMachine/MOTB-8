import canonicalize from "canonicalize";

export interface ControlFileMetadata {
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
  };
}

export function encodeControlFileAAD(
  metadata: ControlFileMetadata
): Buffer {
  const canonical = canonicalize(metadata);

  if (typeof canonical !== "string") {
    throw new Error("Control File metadata canonicalization failed");
  }

  return Buffer.from(canonical, "utf8");
}
