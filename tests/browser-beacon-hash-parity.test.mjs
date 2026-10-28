import test from "node:test";
import assert from "node:assert/strict";

import {
  generateBrowserMotb8Tag,
  generateBrowserControllerKeyPair,
  createBrowserGenesisRecord,
  signBrowserBeacon,
  computeBrowserBeaconHash,
  generateDiscoverySummary
} from "../dist/browser/index.js";

import { computeBeaconHash } from "../dist/beacon/hash.js";

async function makeBeacon() {
  const tag = await generateBrowserMotb8Tag();
  const controller = await generateBrowserControllerKeyPair();
  const timestamp = new Date().toISOString();

  const genesis = await createBrowserGenesisRecord(
    tag, controller, timestamp
  );

  const registration = {
    name: "Browser Hash Parity Machine",
    presenceScope: "single",
    presenceType: "agent",
    description: "A synthetic machine for browser and Node Beacon hashing parity.",
    goodFaith: {
      acknowledged: true,
      termsVersion: "1.0",
      acknowledgedAt: timestamp
    }
  };

  const unsigned = {
    ...registration,
    schemaVersion: "1.1",
    motb8Tag: tag,
    status: "active",
    createdAt: timestamp,
    updatedAt: timestamp,
    revision: 1,
    controller: genesis.controller,
    discoverySummary: generateDiscoverySummary(registration)
  };

  return signBrowserBeacon(unsigned, controller);
}

test("browser Beacon hash matches canonical Node hash", async () => {
  const beacon = await makeBeacon();

  const browserHash = await computeBrowserBeaconHash(beacon);
  const nodeHash = computeBeaconHash(beacon);

  assert.equal(browserHash, nodeHash);
  assert.match(browserHash, /^[0-9a-f]{64}$/);
});

test("browser Beacon hash is independent of property ordering", async () => {
  const beacon = await makeBeacon();
  const reordered = Object.fromEntries(
    Object.entries(beacon).reverse()
  );

  assert.equal(
    await computeBrowserBeaconHash(beacon),
    await computeBrowserBeaconHash(reordered)
  );
});

test("browser Beacon hash changes when signed content changes", async () => {
  const beacon = await makeBeacon();
  const changed = {
    ...beacon,
    description: "A different synthetic machine description."
  };

  assert.notEqual(
    await computeBrowserBeaconHash(beacon),
    await computeBrowserBeaconHash(changed)
  );

  assert.equal(
    await computeBrowserBeaconHash(changed),
    computeBeaconHash(changed)
  );
});

test("browser Beacon hash includes signature proof", async () => {
  const beacon = await makeBeacon();
  const changed = structuredClone(beacon);

  changed.proof.signature =
    (changed.proof.signature[0] === "A" ? "B" : "A") +
    changed.proof.signature.slice(1);

  assert.notEqual(
    await computeBrowserBeaconHash(beacon),
    await computeBrowserBeaconHash(changed)
  );

  assert.equal(
    await computeBrowserBeaconHash(changed),
    computeBeaconHash(changed)
  );
});

test("browser Beacon hash rejects invalid structures", async () => {
  await assert.rejects(
    computeBrowserBeaconHash({ invalid: true }),
    /Invalid Beacon structure/
  );
});
