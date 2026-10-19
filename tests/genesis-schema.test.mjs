import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { generateMotb8Tag } from "../dist/tag/generate.js";

const schema = JSON.parse(
  readFileSync("./schemas/genesis.schema.json", "utf8").replace(/^\uFEFF/, "")
);

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);

function makeGenesis() {
  return {
    schemaVersion: "1.0",
    motb8Tag: generateMotb8Tag(),
    createdAt: "2026-10-19T12:00:00Z",
    controller: {
      id: "#controller-1",
      type: "Ed25519",
      publicKeyJwk: {
        kty: "OKP",
        crv: "Ed25519",
        x: "A".repeat(43)
      }
    },
    proof: {
      type: "Ed25519Signature2026",
      verificationMethod: "#controller-1",
      canonicalization: "RFC8785-JCS",
      signature: "A".repeat(86)
    }
  };
}

test("Genesis schema accepts a structurally valid record", () => {
  assert.equal(validate(makeGenesis()), true);
});

test("Genesis schema rejects missing required fields", () => {
  const record = makeGenesis();
  delete record.controller;
  assert.equal(validate(record), false);
});

test("Genesis schema rejects invalid controller key structure", () => {
  const record = makeGenesis();
  record.controller.publicKeyJwk.kty = "RSA";
  assert.equal(validate(record), false);
});

test("Genesis schema rejects invalid Tag syntax", () => {
  const record = makeGenesis();
  record.motb8Tag = "invalid-tag";
  assert.equal(validate(record), false);
});

test("Genesis schema rejects malformed signatures", () => {
  const record = makeGenesis();
  record.proof.signature = "bad";
  assert.equal(validate(record), false);
});
