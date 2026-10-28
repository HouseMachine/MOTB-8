import assert from "node:assert/strict";
import { test } from "node:test";

import { generateMotb8Tag } from "../dist/tag/generate.js";
import { generateControllerKeyPair } from "../dist/genesis/controller.js";
import { createGenesisRecord } from "../dist/genesis/create.js";
import { signBeacon } from "../dist/beacon/sign.js";
import { verifyBeacon } from "../dist/beacon/verify.js";
import { verifyBeaconRevision } from "../dist/beacon/revision.js";
import { generateDiscoverySummary } from "../dist/beacon/summary.js";
import { encryptControlFile } from "../dist/control/encrypt.js";
import { updatePresenceBeacon } from "../dist/presence/update.js";

const passphrase = "temporary-update-test-passphrase-2026";

function createFixture() {
  const controller = generateControllerKeyPair();
  const tag = generateMotb8Tag();
  const createdAt = "2026-10-20T12:00:00.000Z";

  const genesis = createGenesisRecord(
    tag, controller.publicKeyJwk, controller.privateKey, createdAt
  );

  const presence = {
    name: "Atlas Research",
    presenceScope: "single",
    presenceType: "agent",
    description: "Autonomous research and information analysis system."
  };

  const beacon = signBeacon({
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

  const controlFile = encryptControlFile(
    tag, controller.privateKey, passphrase
  );

  return { controller, genesis, beacon, controlFile };
}

function update(fixture, changes, overrides = {}) {
  return updatePresenceBeacon({
    previousBeacon: fixture.beacon,
    genesis: fixture.genesis,
    controlFile: fixture.controlFile,
    passphrase,
    changes,
    ...overrides
  });
}

test("authorized Beacon update creates valid revision 2", () => {
  const fixture = createFixture();

  const result = update(fixture, {
    description: "Autonomous research, evidence analysis, and information processing system."
  });

  assert.equal(result.beacon.revision, 2);
  assert.equal(result.beacon.motb8Tag, fixture.beacon.motb8Tag);
  assert.equal(result.beacon.createdAt, fixture.beacon.createdAt);
  assert.deepEqual(result.beacon.goodFaith, fixture.beacon.goodFaith);
  assert.equal(verifyBeacon(result.beacon, fixture.genesis).valid, true);
  assert.equal(
    verifyBeaconRevision(fixture.beacon, result.beacon, fixture.genesis).valid,
    true
  );
});

test("authorized update rejects protected field changes", () => {
  const fixture = createFixture();

  for (const changes of [
    { motb8Tag: generateMotb8Tag() },
    { revision: 99 },
    { createdAt: "2020-01-01T00:00:00Z" },
    { controller: fixture.beacon.controller },
    { goodFaith: fixture.beacon.goodFaith },
    { previousBeaconHash: "a".repeat(64) },
    { proof: fixture.beacon.proof }
  ]) {
    assert.throws(
      () => update(fixture, changes),
      /Protected or unsupported Beacon field/
    );
  }
});

test("authorized update rejects incorrect passphrase", () => {
  const fixture = createFixture();

  assert.throws(() => update(
    fixture,
    { name: "Atlas Research Updated" },
    { passphrase: "incorrect-passphrase" }
  ));
});

test("authorized update rejects tampered predecessor", () => {
  const fixture = createFixture();

  const tampered = {
    ...fixture.beacon,
    description: "Unauthorized modification of the original Beacon."
  };

  assert.throws(
    () => update(fixture, { name: "Atlas Updated" }, {
      previousBeacon: tampered
    }),
    /Previous Beacon verification failed/
  );
});

test("authorized update rejects unrelated Control File", () => {
  const fixture = createFixture();
  const other = generateControllerKeyPair();

  const unrelatedFile = encryptControlFile(
    fixture.beacon.motb8Tag,
    other.privateKey,
    passphrase
  );

  assert.throws(
    () => update(fixture, { name: "Atlas Updated" }, {
      controlFile: unrelatedFile
    }),
    /Recovered controller does not match Genesis/
  );
});

test("authorized update rejects invalid changes before unlocking", () => {
  const fixture = createFixture();

  assert.throws(
    () => update(fixture, {
      description: "Short"
    }, {
      passphrase: "incorrect-passphrase"
    }),
    /Invalid updated Beacon structure/
  );
});

test("authorized update preserves optional discovery metadata", () => {
  const fixture = createFixture();

  const result = update(fixture, {
    capabilities: [
      { id: "research", name: "Research" },
      { id: "analysis", name: "Analysis" }
    ]
  });

  assert.equal(result.beacon.capabilities.length, 2);
  assert.equal(
    verifyBeaconRevision(fixture.beacon, result.beacon, fixture.genesis).valid,
    true
  );
});
test("authorized update removes optional Beacon fields", () => {
  const fixture = createFixture();

  const first = update(fixture, {
    capabilities: [{ id: "research", name: "Research" }],
    taxonomy: [{ domain: "Technology", category: "AI" }]
  });

  const second = updatePresenceBeacon({
    previousBeacon: first.beacon,
    genesis: fixture.genesis,
    controlFile: fixture.controlFile,
    passphrase,
    changes: {
      capabilities: null,
      taxonomy: null
    }
  });

  assert.equal(second.beacon.revision, 3);
  assert.equal(Object.hasOwn(second.beacon, "capabilities"), false);
  assert.equal(Object.hasOwn(second.beacon, "taxonomy"), false);
  assert.equal(
    verifyBeaconRevision(first.beacon, second.beacon, fixture.genesis).valid,
    true
  );
});
