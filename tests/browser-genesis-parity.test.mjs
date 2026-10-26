import test from "node:test";
import assert from "node:assert/strict";

import {
  generateBrowserMotb8Tag,
  generateBrowserControllerKeyPair,
  createBrowserGenesisRecord,
  verifyBrowserGenesisRecord
} from "../dist/browser/index.js";

import {
  verifyGenesisRecord
} from "../dist/index.js";

async function setup() {
  const tag = await generateBrowserMotb8Tag();
  const controller = await generateBrowserControllerKeyPair();
  const genesis = await createBrowserGenesisRecord(tag, controller);

  return { tag, controller, genesis };
}

async function assertParity(record, expected) {
  const browser = await verifyBrowserGenesisRecord(record);
  const node = verifyGenesisRecord(record);

  assert.equal(browser.status, expected);
  assert.equal(node.status, expected);
  assert.equal(browser.status, node.status);
}

test("valid Genesis verification matches core", async () => {
  const { genesis } = await setup();
  await assertParity(genesis, "VALID_UNANCHORED");
});

test("modified Genesis signature is rejected consistently", async () => {
  const { genesis } = await setup();

  const modified = {
    ...genesis,
    proof: {
      ...genesis.proof,
      signature:
        (genesis.proof.signature[0] === "A" ? "B" : "A") +
        genesis.proof.signature.slice(1)
    }
  };

  await assertParity(modified, "INVALID");
});

test("substituted Genesis controller is rejected consistently", async () => {
  const { genesis } = await setup();
  const other = await generateBrowserControllerKeyPair();

  const modified = {
    ...genesis,
    controller: {
      ...genesis.controller,
      publicKeyJwk: other.publicKeyJwk
    }
  };

  await assertParity(modified, "INVALID");
});

test("malformed Genesis is rejected consistently", async () => {
  await assertParity(
    { schemaVersion: "1.0", motb8Tag: "invalid" },
    "INVALID"
  );
});
