import assert from "node:assert/strict";
import { test } from "node:test";

import { generateMotb8Tag } from "../dist/tag/generate.js";
import { generateControllerKeyPair } from "../dist/genesis/controller.js";
import { createGenesisRecord } from "../dist/genesis/create.js";
import { signBeacon } from "../dist/beacon/sign.js";
import { verifyBeacon } from "../dist/beacon/verify.js";
import { generateDiscoverySummary } from "../dist/beacon/summary.js";
import { computeBeaconHash } from "../dist/beacon/hash.js";
import { encryptControlFile } from "../dist/control/encrypt.js";
import { migratePresenceBeacon } from "../dist/presence/migrate.js";
import { verifyBeaconChain } from "../dist/beacon/chain.js";

const passphrase = "temporary-migration-test-passphrase-2026";

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

  const legacyBeacon = signBeacon({
    schemaVersion: "1.0",
    motb8Tag: tag,
    ...presence,
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

  const controlFile = encryptControlFile(
    tag,
    controller.privateKey,
    passphrase
  );

  return { controller, genesis, legacyBeacon, controlFile };
}

function migrate(fixture, overrides = {}) {
  return migratePresenceBeacon({
    legacyBeacon: fixture.legacyBeacon,
    genesis: fixture.genesis,
    controlFile: fixture.controlFile,
    passphrase,
    ...overrides
  });
}

test("authorized legacy migration produces valid v1.1 revision 1", () => {
  const fixture = createFixture();
  const result = migrate(fixture);

  assert.equal(result.beacon.schemaVersion, "1.1");
  assert.equal(result.beacon.revision, 1);
  assert.equal("previousBeaconHash" in result.beacon, false);
  assert.equal(verifyBeacon(result.beacon, fixture.genesis).valid, true);
});

test("migration preserves identity and original metadata", () => {
  const fixture = createFixture();
  const original = structuredClone(fixture.legacyBeacon);

  const result = migrate(fixture);

  assert.equal(result.beacon.motb8Tag, original.motb8Tag);
  assert.equal(result.beacon.createdAt, original.createdAt);
  assert.deepEqual(result.beacon.controller, original.controller);
  assert.deepEqual(result.beacon.goodFaith, original.goodFaith);
  assert.deepEqual(fixture.legacyBeacon, original);
  assert.equal(result.legacyBeaconHash, computeBeaconHash(original));
});

test("migration rejects incorrect passphrase", () => {
  const fixture = createFixture();

  assert.throws(() => migrate(fixture, {
    passphrase: "incorrect-passphrase"
  }));
});

test("migration rejects tampered legacy Beacon", () => {
  const fixture = createFixture();

  const tampered = {
    ...fixture.legacyBeacon,
    name: "Unauthorized Machine Name"
  };

  assert.throws(
    () => migrate(fixture, { legacyBeacon: tampered }),
    /Legacy Beacon verification failed/
  );
});

test("migration rejects unrelated Genesis", () => {
  const fixture = createFixture();
  const otherTag = generateMotb8Tag();

  const unrelatedGenesis = createGenesisRecord(
    otherTag,
    fixture.controller.publicKeyJwk,
    fixture.controller.privateKey
  );

  assert.throws(
    () => migrate(fixture, { genesis: unrelatedGenesis }),
    /Legacy Beacon verification failed/
  );
});

test("migration rejects unrelated controller credentials", () => {
  const fixture = createFixture();
  const otherController = generateControllerKeyPair();

  const unrelatedFile = encryptControlFile(
    fixture.legacyBeacon.motb8Tag,
    otherController.privateKey,
    passphrase
  );

  assert.throws(
    () => migrate(fixture, { controlFile: unrelatedFile }),
    /Recovered controller does not match Genesis/
  );
});

test("migration rejects v1.1 Beacon as legacy input", () => {
  const fixture = createFixture();
  const result = migrate(fixture);

  assert.throws(
    () => migrate(fixture, { legacyBeacon: result.beacon }),
    /Migration requires legacy Beacon v1.0/
  );
});

test("migration rejects inconsistent Genesis creation timestamp", () => {
  const fixture = createFixture();

  const controller = fixture.controller;
  const alteredGenesis = createGenesisRecord(
    fixture.legacyBeacon.motb8Tag,
    controller.publicKeyJwk,
    controller.privateKey,
    "2026-10-19T12:00:00.000Z"
  );

  assert.throws(
    () => migrate(fixture, { genesis: alteredGenesis }),
    /creation timestamps differ/
  );
});

test("migrated v1.1 Beacon forms a valid supplied revision chain", () => {
  const fixture = createFixture();
  const migrated = migrate(fixture);

  const result = verifyBeaconChain(
    [migrated.beacon],
    fixture.genesis
  );

  assert.equal(
    result.status,
    "VALID_SUPPLIED_CHAIN",
    result.reason
  );
});

test("migration timestamp remains informational", () => {
  const fixture = createFixture();
  const before = Date.now();

  const result = migrate(fixture);
  const after = Date.now();

  const migratedTime = Date.parse(result.migratedAt);

  assert.equal(Number.isFinite(migratedTime), true);
  assert.equal(migratedTime >= before, true);
  assert.equal(migratedTime <= after, true);

  assert.equal(
    Object.hasOwn(result.beacon, "migratedAt"),
    false
  );

  assert.equal(
    result.beacon.updatedAt,
    result.beacon.createdAt
  );

  assert.equal(
    verifyBeaconChain([result.beacon], fixture.genesis).valid,
    true
  );
});
