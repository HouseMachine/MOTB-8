import { randomBytes } from "node:crypto";
import { encodeCrockfordBase32 } from "./base32.js";
import { computeTagChecksum } from "./checksum.js";

export function generateMotb8Tag(): string {
  const random = randomBytes(20);
  const payload = encodeCrockfordBase32(random);
  const checksum = computeTagChecksum(payload);

  return `([[!MOTB-8:1:${payload}:${checksum}]])`;
}
