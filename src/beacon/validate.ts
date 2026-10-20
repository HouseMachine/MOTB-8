import { readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

function loadSchema(filename: string): object {
  return JSON.parse(
    readFileSync(
      new URL(`../../schemas/${filename}`, import.meta.url),
      "utf8"
    ).replace(/^\uFEFF/, "")
  ) as object;
}

const AjvConstructor = Ajv2020.default;
const ajv = new AjvConstructor({ allErrors: true });
addFormats.default(ajv);

const validateV10 = ajv.compile(loadSchema("beacon.schema.json"));
const validateV11 = ajv.compile(loadSchema("beacon-v1.1.schema.json"));

function getValidator(record: unknown) {
  if (
    typeof record !== "object" ||
    record === null ||
    Array.isArray(record)
  ) {
    return null;
  }

  const version = (record as Record<string, unknown>).schemaVersion;

  if (version === "1.0") return validateV10;
  if (version === "1.1") return validateV11;

  return null;
}

export function validateBeaconStructure(record: unknown): boolean {
  const validator = getValidator(record);
  return validator ? Boolean(validator(record)) : false;
}

export function validateUnsignedBeaconStructure(record: unknown): boolean {
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

  const candidate = {
    ...record,
    proof: {
      type: "Ed25519Signature2026",
      verificationMethod: "#controller-1",
      canonicalization: "RFC8785-JCS",
      signature: "A".repeat(86)
    }
  };

  return validateBeaconStructure(candidate);
}
