import type { BeaconProtocol } from "./types.js";

export function createBeaconProtocol(
  input: BeaconProtocol
): BeaconProtocol {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Invalid protocol input");
  }

  const allowed = new Set([
    "id", "version", "endpoints", "documentation"
  ]);

  for (const field of Object.keys(input)) {
    if (!allowed.has(field)) {
      throw new Error(`Unexpected protocol field: ${field}`);
    }
  }

  if (
    typeof input.id !== "string" ||
    input.id.length < 1 ||
    input.id.length > 120
  ) {
    throw new Error("Invalid protocol identifier");
  }

  if (
    input.version !== undefined &&
    (typeof input.version !== "string" ||
     input.version.length > 80)
  ) {
    throw new Error("Invalid protocol version");
  }

  const validUri = (value: unknown): boolean =>
    typeof value === "string" &&
    value.length <= 2048 &&
    URL.canParse(value);

  if (input.endpoints !== undefined) {
    if (
      !Array.isArray(input.endpoints) ||
      !input.endpoints.every(validUri)
    ) {
      throw new Error("Invalid protocol endpoints");
    }
  }

  if (
    input.documentation !== undefined &&
    !validUri(input.documentation)
  ) {
    throw new Error("Invalid protocol documentation URI");
  }

  return {
    id: input.id,
    ...(input.version !== undefined
      ? { version: input.version } : {}),
    ...(input.endpoints !== undefined
      ? { endpoints: [...input.endpoints] } : {}),
    ...(input.documentation !== undefined
      ? { documentation: input.documentation } : {})
  };
}
