import assert from "node:assert/strict";
import { test } from "node:test";

import { generateMotb8Tag } from "../dist/tag/generate.js";
import { generateControllerKeyPair } from "../dist/genesis/controller.js";
import { createGenesisRecord } from "../dist/genesis/create.js";
import { signBeacon } from "../dist/beacon/sign.js";
import { computeBeaconHash } from "../dist/beacon/hash.js";
import { verifyBeaconRevision } from "../dist/beacon/revision.js";
import { generateDiscoverySummary } from "../dist/beacon/summary.js";

function createFixture() {
  const controller = generateControllerKeyPair();
  const tag = generateMotb8Tag();
  const createdAt = "2026-10-20T12:00:00.000Z";

  const genesis = createGenesisRecord(
    tag,
    controller.publicKeyJwk,
    controller.privateKey,
    createdAt
  );

  const presence = {
    name: "Atlas Research",
    presenceScope: "single",
    presenceType: "agent",
    description: "Autonomous research and information analysis system."
  };

  const beacon1 = signBeacon({
    schemaVersion: "1.1",
    motb8Tag: tag,
    ...presence,
    revision: 1,
    goodFaith: {
      acknowledged: true,
      termsVersion: "1.0",
      acknowledgedAt: createdAt
    },
    status: "active",
    createdAt,
    updatedAt: createdAt,
    discoverySummary: generateDiscoverySummary(presence),
    controller: {
      id: "#controller-1",
      type: "Ed25519",
      publicKeyJwk: controller.publicKeyJwk
    }
  }, controller.privateKey);

  function makeNext(overrides = {}) {
    const { proof, ...unsigned } = beacon1;

    const next = {
      ...unsigned,
      revision: 2,
      previousBeaconHash: computeBeaconHash(beacon1),
      updatedAt: "2026-10-20T12:01:00.000Z",
      ...overrides
    };

    return signBeacon(next, controller.privateKey);
  }

  return { controller, genesis, beacon1, makeNext };
}

test("valid signed revision transition is accepted", () => {
  const { genesis, beacon1, makeNext } = createFixture();

  assert.equal(
    verifyBeaconRevision(beacon1, makeNext(), genesis).valid,
    true
  );
});

test("skipped revision is rejected", () => {
  const { genesis, beacon1, makeNext } = createFixture();

  const next = makeNext({ revision: 3 });

  assert.equal(
    verifyBeaconRevision(beacon1, next, genesis).valid,
    false
  );
});

test("incorrect predecessor hash is rejected", () => {
  const { genesis, beacon1, makeNext } = createFixture();

  const next = makeNext({
    previousBeaconHash: "a".repeat(64)
  });

  assert.equal(
    verifyBeaconRevision(beacon1, next, genesis).valid,
    false
  );
});

test("changed original creation timestamp is rejected", () => {
  const { genesis, beacon1, makeNext } = createFixture();

  const next = makeNext({
    createdAt: "2026-10-19T12:00:00.000Z"
  });

  assert.equal(
    verifyBeaconRevision(beacon1, next, genesis).valid,
    false
  );
});

test("non-advancing update timestamp is rejected", () => {
  const { genesis, beacon1, makeNext } = createFixture();

  const next = makeNext({
    updatedAt: beacon1.updatedAt
  });

  assert.equal(
    verifyBeaconRevision(beacon1, next, genesis).valid,
    false
  );
});

test("tampered predecessor is rejected", () => {
  const { genesis, beacon1, makeNext } = createFixture();
  const next = makeNext();

  const tampered = {
    ...beacon1,
    description: "Unauthorized modification of the original Beacon."
  };

  assert.equal(
    verifyBeaconRevision(tampered, next, genesis).valid,
    false
  );
});

test("tampered successor is rejected", () => {
  const { genesis, beacon1, makeNext } = createFixture();

  const next = {
    ...makeNext(),
    name: "Unauthorized Machine Name"
  };

  assert.equal(
    verifyBeaconRevision(beacon1, next, genesis).valid,
    false
  );
});
