import assert from "node:assert/strict";
import { test } from "node:test";
import { generateMotb8Tag } from "../dist/tag/generate.js";
import { generateControllerKeyPair } from "../dist/genesis/controller.js";
import { createGenesisRecord } from "../dist/genesis/create.js";
import { verifyGenesisRecord } from "../dist/genesis/verify.js";

function createFixture() {
  const controller = generateControllerKeyPair();
  const genesis = createGenesisRecord(
    generateMotb8Tag(),
    controller.publicKeyJwk,
    controller.privateKey
  );

  return { controller, genesis };
}

test("valid self-signed Genesis returns VALID_UNANCHORED", () => {
  const { genesis } = createFixture();
  const result = verifyGenesisRecord(genesis);

  assert.equal(result.status, "VALID_UNANCHORED");
});

test("modified Genesis timestamp invalidates signature", () => {
  const { genesis } = createFixture();
  const modified = {
    ...genesis,
    createdAt: "2020-01-01T00:00:00Z"
  };

  assert.equal(verifyGenesisRecord(modified).status, "INVALID");
});

test("modified Genesis Tag invalidates binding", () => {
  const { genesis } = createFixture();
  const modified = {
    ...genesis,
    motb8Tag: generateMotb8Tag()
  };

  assert.equal(verifyGenesisRecord(modified).status, "INVALID");
});

test("modified controller public key invalidates signature", () => {
  const { genesis } = createFixture();
  const other = generateControllerKeyPair();

  const modified = {
    ...genesis,
    controller: {
      ...genesis.controller,
      publicKeyJwk: other.publicKeyJwk
    }
  };

  assert.equal(verifyGenesisRecord(modified).status, "INVALID");
});

test("invalid Genesis schema is rejected", () => {
  const { genesis } = createFixture();
  const modified = { ...genesis, schemaVersion: "99.0" };

  assert.equal(verifyGenesisRecord(modified).status, "INVALID");
});

test("modified Genesis proof metadata is rejected", () => {
  const { genesis } = createFixture();
  const modified = structuredClone(genesis);

  modified.proof.verificationMethod = "#unknown-controller";

  assert.equal(verifyGenesisRecord(modified).status, "INVALID");
});
