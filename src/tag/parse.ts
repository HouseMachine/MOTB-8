import { computeTagChecksum } from "./checksum.js";

const TAG_PATTERN =
  /^\(\[\[!MOTB-8:1:([0-9A-HJKMNP-TV-Z]{32}):([0-9A-HJKMNP-TV-Z]{2})\]\]\)$/;

export interface ParsedMotb8Tag {
  version: 1;
  payload: string;
  checksum: string;
  canonicalTag: string;
}

export function parseMotb8Tag(tag: string): ParsedMotb8Tag {
  const match = TAG_PATTERN.exec(tag);

  if (!match) {
    throw new Error("Invalid MOTB-8 Tag format");
  }

  const payload = match[1]!;
  const checksum = match[2]!;

  if (checksum !== computeTagChecksum(payload)) {
    throw new Error("Invalid MOTB-8 Tag checksum");
  }

  return {
    version: 1,
    payload,
    checksum,
    canonicalTag: tag,
  };
}

export function isValidMotb8Tag(tag: string): boolean {
  try {
    parseMotb8Tag(tag);
    return true;
  } catch {
    return false;
  }
}
