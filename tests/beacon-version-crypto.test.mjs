import assert from "node:assert/strict";
import { test } from "node:test";

import { generateMotb8Tag } from "../dist/tag/generate.js";
import { generateControllerKeyPair } from "../dist/genesis/controller.js";
import { createGenesisRecord } from "../dist/genesis/create.js";
import { signBeacon } from "../dist/beacon/sign.js";
import { verifyBeacon } from "../dist/beacon/verify.js";
import { generateDiscoverySummary } from "../dist/beacon/summary.js";
import { computeBeaconHash } from "../dist/beacon/hash.js";

function createFixture(version) {
  const controller = generateControllerKeyPair();
  const tag = generateMotb8Tag();
  const timestamp = new Date().toISOString();

  const genesis = createGenesisRecord(
    tag,
    controller.publicKeyJwk,
    controller.privateKey,
    timestamp
  );

  const presence = {
    name: "Atlas Research",
    presenceScope: "single",
    presenceType: "agent",
    description: "Autonomous research and information analysis system."
  };

  const unsigned = {
    schemaVersion: version,
    motb8Tag: tag,
    ...presence,
    ...(version === "1.1" ? { revision: 1 } : {}),
    goodFaith: {
      acknowledged: true,
      termsVersion: "1.0",
      acknowledgedAt: timestamp
    },
    status: "active",
    createdAt: timestamp,
    updatedAt: timestamp,
    discoverySummary: generateDiscoverySummary(presence),
    controller: {
      id: "#controller-1",
      type: "Ed25519",
      publicKeyJwk: controller.publicKeyJwk
    }
  };

  return {
    genesis,
    beacon: signBeacon(unsigned, controller.privateKey)
  };
}

test("legacy v1.0 signed Beacon remains verifiable", () => {
  const { genesis, beacon } = createFixture("1.0");
  const result = verifyBeacon(beacon, genesis);

  assert.equal(result.valid, true);
  assert.equal(result.genesisStatus, "VALID_UNANCHORED");
});

test("v1.1 initial signed Beacon verifies against Genesis", () => {
  const { genesis, beacon } = createFixture("1.1");
  const result = verifyBeacon(beacon, genesis);

  assert.equal(result.valid, true);
  assert.equal(result.genesisStatus, "VALID_UNANCHORED");
  assert.equal(beacon.revision, 1);
  assert.equal("previousBeaconHash" in beacon, false);
});

test("v1.1 signed Beacon rejects content tampering", () => {
  const { genesis, beacon } = createFixture("1.1");

  const modified = {
    ...beacon,
    description: "Unauthorized modification of the machine description."
  };

  assert.equal(verifyBeacon(modified, genesis).valid, false);
});

test("v1.1 signed Beacon rejects revision tampering", () => {
  const { genesis, beacon } = createFixture("1.1");

  const modified = {
    ...beacon,
    revision: 2,
    previousBeaconHash: "a".repeat(64)
  };

  assert.equal(verifyBeacon(modified, genesis).valid, false);
});

test("v1.1 signed Beacon supports deterministic hashing", () => {
  const { genesis, beacon } = createFixture("1.1");

  assert.equal(verifyBeacon(beacon, genesis).valid, true);
  assert.match(computeBeaconHash(beacon), /^[0-9a-f]{64}$/);
});
