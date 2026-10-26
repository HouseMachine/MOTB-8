import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import standaloneCode from "ajv/dist/standalone/index.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const schemas = [
  ["beaconV10", "beacon.schema.json"],
  ["beaconV11", "beacon-v1.1.schema.json"],
  ["controlFileV10", "control-file.schema.json"],
  ["genesisV10", "genesis.schema.json"],
];

const ajv = new Ajv2020({
  allErrors: true,
  code: {
    source: true,
    esm: false,
  },
});

addFormats(ajv);

const validators = {};

for (const [name, filename] of schemas) {
  const schema = JSON.parse(
    readFileSync(resolve(root, "schemas", filename), "utf8")
      .replace(/^\uFEFF/, "")
  );

  if (!schema.$id) {
    schema.$id = `urn:motb8:browser-schema:${name}`;
  }

  ajv.compile(schema);
  validators[name] = schema.$id;
}

const generated = standaloneCode(ajv, validators);

const destination = resolve(
  root,
  "src",
  "browser",
  "generated",
  "beacon-validators.cjs"
);

mkdirSync(dirname(destination), { recursive: true });

writeFileSync(
  destination,
  generated,
  "utf8"
);

console.log("Browser Beacon validators generated successfully.");
