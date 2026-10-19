const CROCKFORD_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function encodeCrockfordBase32(bytes: Uint8Array): string {
  let bits = 0;
  let buffer = 0;
  let result = "";

  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      bits -= 5;
      result += CROCKFORD_ALPHABET[(buffer >>> bits) & 31];
    }
  }

  if (bits > 0) {
    result += CROCKFORD_ALPHABET[(buffer << (5 - bits)) & 31];
  }

  return result;
}
