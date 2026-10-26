import { encodeCrockfordBase32 } from "../tag/base32.js";

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const CORE_PREFIX = "MOTB-8:1:";

const TAG_PATTERN =
  /^\(\[\[!MOTB-8:1:([0-9A-HJKMNP-TV-Z]{32}):([0-9A-HJKMNP-TV-Z]{2})\]\]\)$/;

export async function computeBrowserTagChecksum(
  payload: string
): Promise<string> {
  if (!/^[0-9A-HJKMNP-TV-Z]{32}$/.test(payload)) {
    throw new Error("Invalid MOTB-8 identity payload");
  }

  const input = new TextEncoder().encode(CORE_PREFIX + payload);

  const digest = new Uint8Array(
    await crypto.subtle.digest("SHA-256", input)
  );

  const value = (digest[0]! << 2) | (digest[1]! >>> 6);

  return (
    ALPHABET[(value >>> 5) & 31]! +
    ALPHABET[value & 31]!
  );
}

export async function generateBrowserMotb8Tag(): Promise<string> {
  const random = crypto.getRandomValues(new Uint8Array(20));
  const payload = encodeCrockfordBase32(random);
  const checksum = await computeBrowserTagChecksum(payload);

  return `([[!MOTB-8:1:${payload}:${checksum}]])`;
}

export async function isValidBrowserMotb8Tag(
  tag: string
): Promise<boolean> {
  const match = TAG_PATTERN.exec(tag);

  if (!match) return false;

  return match[2] === await computeBrowserTagChecksum(match[1]!);
}
