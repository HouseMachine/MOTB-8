import { readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { parseMotb8Tag } from "../tag/parse.js";

const schema = JSON.parse(
  readFileSync(
    new URL("../../schemas/control-file.schema.json", import.meta.url),
    "utf8"
  ).replace(/^\uFEFF/, "")
) as object;

const AjvConstructor = Ajv2020.default;
const ajv = new AjvConstructor({ allErrors: true });
addFormats.default(ajv);

const validateSchema = ajv.compile(schema);

export function validateControlFileStructure(
  input: unknown
): boolean {
  if (!validateSchema(input)) {
    return false;
  }

  const record = input as { motb8Tag: string };

  try {
    parseMotb8Tag(record.motb8Tag);
    return true;
  } catch {
    return false;
  }
}
