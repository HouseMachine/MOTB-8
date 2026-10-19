import { createHash } from "node:crypto";

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const CORE_PREFIX = "MOTB-8:1:";

export function computeTagChecksum(payload: string): string {
  if (!/^[0-9A-HJKMNP-TV-Z]{32}$/.test(payload)) {
    throw new Error("Invalid MOTB-8 identity payload");
  }

  const digest = createHash("sha256")
    .update(CORE_PREFIX + payload, "ascii")
    .digest();

  const first = digest[0]!;
  const second = digest[1]!;

  const value = (first << 2) | (second >>> 6);

  return ALPHABET[(value >>> 5) & 31]! +
    ALPHABET[value & 31]!;
}
