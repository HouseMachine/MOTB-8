import { beaconV10, beaconV11 } from "./generated/beacon-validators.cjs";

function getValidator(record: unknown) {
  if (
    typeof record !== "object" ||
    record === null ||
    Array.isArray(record)
  ) {
    return null;
  }

  const version = (record as Record<string, unknown>).schemaVersion;

  if (version === "1.0") return beaconV10;
  if (version === "1.1") return beaconV11;

  return null;
}

export function validateBrowserBeaconStructure(
  record: unknown
): boolean {
  const validator = getValidator(record);
  return validator ? Boolean(validator(record)) : false;
}

export function validateUnsignedBrowserBeaconStructure(
  record: unknown
): boolean {
  if (
    typeof record !== "object" ||
    record === null ||
    Array.isArray(record)
  ) {
    return false;
  }

  if (Object.prototype.hasOwnProperty.call(record, "proof")) {
    return false;
  }

  return validateBrowserBeaconStructure({
    ...record,
    proof: {
      type: "Ed25519Signature2026",
      verificationMethod: "#controller-1",
      canonicalization: "RFC8785-JCS",
      signature: "A".repeat(86)
    }
  });
}
