import { readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const schema = JSON.parse(
  readFileSync(
    new URL("../../schemas/beacon.schema.json", import.meta.url),
    "utf8"
  ).replace(/^\uFEFF/, "")
) as object;

const AjvConstructor = Ajv2020.default;
const ajv = new AjvConstructor({ allErrors: true });
addFormats.default(ajv);

const validate = ajv.compile(schema);

export function validateBeaconStructure(record: unknown): boolean {
  return Boolean(validate(record));
}

export function validateUnsignedBeaconStructure(record: unknown): boolean {
  if (typeof record !== "object" || record === null || Array.isArray(record)) {
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

  return Boolean(validate(candidate));
}
