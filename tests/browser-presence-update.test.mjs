import test from "node:test";
import assert from "node:assert/strict";

import {
  generateBrowserMotb8Tag,
  generateBrowserControllerKeyPair,
  createBrowserGenesisRecord,
  signBrowserBeacon,
  encryptBrowserControlFile,
  updateBrowserPresenceBeacon,
  verifyBrowserBeacon,
  verifyBrowserBeaconRevision,
  computeBrowserBeaconHash,
  generateDiscoverySummary
} from "../dist/browser/index.js";

import { verifyBeacon } from "../dist/beacon/verify.js";
import { verifyBeaconRevision } from "../dist/beacon/revision.js";
import { computeBeaconHash } from "../dist/beacon/hash.js";

const passphrase = "synthetic-browser-update-test-2026";

async function createFixture() {
  const tag = await generateBrowserMotb8Tag();
  const controller = await generateBrowserControllerKeyPair();
  const timestamp = "2026-10-20T12:00:00.000Z";

  const genesis = await createBrowserGenesisRecord(
    tag, controller, timestamp
  );

  const registration = {
    name: "Browser Update Test Machine",
    presenceScope: "single",
    presenceType: "agent",
    description: "A synthetic machine for authorized browser Beacon update testing.",
    goodFaith: {
      acknowledged: true,
      termsVersion: "1.0",
      acknowledgedAt: timestamp
    }
  };

  const previousBeacon = await signBrowserBeacon({
    ...registration,
    schemaVersion: "1.1",
    motb8Tag: tag,
    status: "active",
    createdAt: timestamp,
    updatedAt: timestamp,
    revision: 1,
    controller: genesis.controller,
    discoverySummary: generateDiscoverySummary(registration)
  }, controller);

  const controlFile = await encryptBrowserControlFile(
    tag, controller, passphrase
  );

  return { tag, genesis, previousBeacon, controlFile, controller };
}

function update(fixture, changes, overrides = {}) {
  return updateBrowserPresenceBeacon({
    previousBeacon: fixture.previousBeacon,
    genesis: fixture.genesis,
    controlFile: fixture.controlFile,
    passphrase,
    changes,
    ...overrides
  });
}

test("authorized browser update creates Node-verifiable revision 2", async () => {
  const fixture = await createFixture();

  const result = await update(fixture, {
    description: "An updated synthetic machine for browser and Node verification."
  });

  assert.equal(result.beacon.revision, 2);
  assert.equal(result.beacon.motb8Tag, fixture.tag);
  assert.equal(result.beacon.createdAt, fixture.previousBeacon.createdAt);
  assert.deepEqual(result.beacon.controller, fixture.previousBeacon.controller);
  assert.deepEqual(result.beacon.goodFaith, fixture.previousBeacon.goodFaith);

  assert.equal(
    result.previousBeaconHash,
    computeBeaconHash(fixture.previousBeacon)
  );

  assert.equal(
    result.previousBeaconHash,
    await computeBrowserBeaconHash(fixture.previousBeacon)
  );

  assert.equal(
    (await verifyBrowserBeacon(result.beacon, fixture.genesis)).valid,
    true
  );

  assert.equal(
    verifyBeacon(result.beacon, fixture.genesis).valid,
    true
  );

  const browserRevision = await verifyBrowserBeaconRevision(
    fixture.previousBeacon, result.beacon, fixture.genesis
  );

  const nodeRevision = verifyBeaconRevision(
    fixture.previousBeacon, result.beacon, fixture.genesis
  );

  assert.deepEqual(browserRevision, nodeRevision);
  assert.equal(browserRevision.valid, true);
});

test("protected Beacon fields cannot be changed", async () => {
  const fixture = await createFixture();

  for (const changes of [
    { motb8Tag: await generateBrowserMotb8Tag() },
    { revision: 99 },
    { createdAt: "2020-01-01T00:00:00.000Z" },
    { controller: fixture.previousBeacon.controller },
    { goodFaith: fixture.previousBeacon.goodFaith },
    { previousBeaconHash: "a".repeat(64) },
    { proof: fixture.previousBeacon.proof }
  ]) {
    await assert.rejects(
      update(fixture, changes),
      /Protected or unsupported Beacon field/
    );
  }
});

test("incorrect passphrase rejects authorized update", async () => {
  const fixture = await createFixture();

  await assert.rejects(
    update(fixture, { name: "Updated Machine" }, {
      passphrase: "incorrect-passphrase"
    })
  );
});

test("tampered predecessor rejects authorized update", async () => {
  const fixture = await createFixture();

  await assert.rejects(
    update(fixture, { name: "Updated Machine" }, {
      previousBeacon: {
        ...fixture.previousBeacon,
        description: "Unauthorized predecessor modification."
      }
    }),
    /Previous Beacon verification failed/
  );
});

test("unrelated controller cannot authorize an update", async () => {
  const fixture = await createFixture();
  const otherController = await generateBrowserControllerKeyPair();

  const unrelatedControlFile = await encryptBrowserControlFile(
    fixture.tag,
    otherController,
    passphrase
  );

  await assert.rejects(
    update(fixture, { name: "Updated Machine" }, {
      controlFile: unrelatedControlFile
    }),
    /Recovered controller does not match Genesis/
  );
});

test("invalid changes are rejected before controller unlock", async () => {
  const fixture = await createFixture();

  await assert.rejects(
    update(fixture, { description: "Short" }, {
      passphrase: "incorrect-passphrase"
    }),
    /Invalid updated Beacon structure/
  );
});

test("optional capabilities survive a signed update", async () => {
  const fixture = await createFixture();

  const result = await update(fixture, {
    capabilities: [
      { id: "research", name: "Research" },
      { id: "analysis", name: "Analysis" }
    ]
  });

  assert.equal(result.beacon.capabilities.length, 2);

  assert.equal(
    verifyBeaconRevision(
      fixture.previousBeacon,
      result.beacon,
      fixture.genesis
    ).valid,
    true
  );
});
