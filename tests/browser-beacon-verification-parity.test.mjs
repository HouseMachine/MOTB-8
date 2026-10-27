import test from "node:test";
import assert from "node:assert/strict";

import { generateBrowserMotb8Tag, generateBrowserControllerKeyPair, createBrowserGenesisRecord, signBrowserBeacon, verifyBrowserBeacon, generateDiscoverySummary } from "../dist/browser/index.js";
import { verifyBeacon } from "../dist/index.js";

async function makeRecords(version = "1.1") {
  const tag = await generateBrowserMotb8Tag();
  const controller = await generateBrowserControllerKeyPair();
  const timestamp = new Date().toISOString();
  const genesis = await createBrowserGenesisRecord(tag, controller, timestamp);
  const registration = {
    name: "Browser Verification Machine",
    presenceScope: "single",
    presenceType: "agent",
    description: "A machine used for browser and Node Beacon verification parity.",
    goodFaith: { acknowledged: true, termsVersion: "1.0", acknowledgedAt: timestamp }
  };
  const unsigned = {
    ...registration,
    schemaVersion: version,
    motb8Tag: tag,
    status: "active",
    createdAt: timestamp,
    updatedAt: timestamp,
    controller: genesis.controller,
    discoverySummary: generateDiscoverySummary(registration),
    ...(version === "1.1" ? { revision: 1 } : {})
  };
  const beacon = await signBrowserBeacon(unsigned, controller);
  return { beacon, genesis, controller };
}

async function assertParity(beacon, genesis, expectedValid) {
  const browser = await verifyBrowserBeacon(beacon, genesis);
  const node = verifyBeacon(beacon, genesis);
  assert.equal(browser.valid, expectedValid, browser.reason);
  assert.deepEqual(browser, node);
}

test("valid Beacon v1.0 matches Node verification", async () => {
  const { beacon, genesis } = await makeRecords("1.0");
  await assertParity(beacon, genesis, true);
});

test("valid Beacon v1.1 matches Node verification", async () => {
  const { beacon, genesis } = await makeRecords("1.1");
  await assertParity(beacon, genesis, true);
});

test("modified Beacon content is rejected consistently", async () => {
  const { beacon, genesis } = await makeRecords();
  const modified = { ...beacon, description: "A changed description after signing." };
  await assertParity(modified, genesis, false);
});

test("modified Beacon signature is rejected consistently", async () => {
  const { beacon, genesis } = await makeRecords();
  const signature = beacon.proof.signature;
  const modified = {
    ...beacon,
    proof: { ...beacon.proof, signature: (signature[0] === "A" ? "B" : "A") + signature.slice(1) }
  };
  await assertParity(modified, genesis, false);
});

test("substituted Beacon controller is rejected consistently", async () => {
  const { beacon, genesis } = await makeRecords();
  const other = await generateBrowserControllerKeyPair();
  const modified = { ...beacon, controller: { ...beacon.controller, publicKeyJwk: other.publicKeyJwk } };
  await assertParity(modified, genesis, false);
});

test("Beacon and Genesis Tag mismatch is rejected consistently", async () => {
  const { beacon, genesis } = await makeRecords();
  const other = await makeRecords();
  await assertParity({ ...beacon, motb8Tag: other.beacon.motb8Tag }, genesis, false);
});

test("invalid Genesis is rejected consistently", async () => {
  const { beacon, genesis } = await makeRecords();
  const modified = { ...genesis, proof: { ...genesis.proof, signature: "A".repeat(86) } };
  await assertParity(beacon, modified, false);
});

test("malformed Beacon is rejected consistently", async () => {
  const { genesis } = await makeRecords();
  await assertParity({ schemaVersion: "1.1" }, genesis, false);
});
