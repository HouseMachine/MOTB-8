import type { BeaconAttachment } from "./types.js";
import { validateJsonData } from "./json-validate.js";

export function createBeaconAttachment(
  input: BeaconAttachment
): BeaconAttachment {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Invalid attachment input");
  }

  const allowed = new Set(["type", "version", "data"]);

  for (const field of Object.keys(input)) {
    if (!allowed.has(field)) {
      throw new Error(`Unexpected attachment field: ${field}`);
    }
  }

  if (
    typeof input.type !== "string" ||
    input.type.length < 1 ||
    input.type.length > 200
  ) {
    throw new Error("Invalid attachment type");
  }

  if (
    typeof input.version !== "string" ||
    input.version.length < 1 ||
    input.version.length > 40
  ) {
    throw new Error("Invalid attachment version");
  }

  if (
    !input.data ||
    typeof input.data !== "object" ||
    Array.isArray(input.data)
  ) {
    throw new Error("Invalid attachment data");
  }

  if (!validateJsonData(input.data)) {
    throw new Error("Attachment data must be valid bounded JSON");
  }

  const serialized = JSON.stringify(input.data);

  if (Buffer.byteLength(serialized, "utf8") > 262144) {
    throw new Error("Attachment JSON payload exceeds 256 KiB");
  }

  return {
    type: input.type,
    version: input.version,
    data: structuredClone(input.data)
  };
}
