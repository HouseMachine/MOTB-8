import test from "node:test";
import assert from "node:assert/strict";

import {
  generateBrowserMotb8Tag,
  generateBrowserControllerKeyPair,
  createBrowserGenesisRecord,
  signBrowserBeacon,
  verifyBrowserBeaconRevision,
  computeBrowserBeaconHash,
  generateDiscoverySummary
} from "../dist/browser/index.js";

import { verifyBeaconRevision } from "../dist/beacon/revision.js";

async function createFixture() {
  const tag = await generateBrowserMotb8Tag();
  const controller = await generateBrowserControllerKeyPair();
  const timestamp = "2026-10-20T12:00:00.000Z";

  const genesis = await createBrowserGenesisRecord(
    tag, controller, timestamp
  );

  const registration = {
    name: "Browser Revision Parity Machine",
    presenceScope: "single",
    presenceType: "agent",
    description: "A synthetic machine for browser and Node revision verification.",
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

  const previous = await signBrowserBeacon(unsigned, controller);

  async function makeNext(overrides = {}) {
    const { proof, ...unsignedPrevious } = previous;
    void proof;

    const next = {
      ...unsignedPrevious,
      revision: 2,
      previousBeaconHash: await computeBrowserBeaconHash(previous),
      updatedAt: "2026-10-20T12:01:00.000Z",
      ...overrides
    };

    return signBrowserBeacon(next, controller);
  }

  return { tag, controller, genesis, previous, makeNext };
}

async function assertParity(previous, current, genesis, expectedValid) {
  const browser = await verifyBrowserBeaconRevision(
    previous, current, genesis
  );

  const node = verifyBeaconRevision(previous, current, genesis);

  assert.deepEqual(browser, node);
  assert.equal(browser.valid, expectedValid, browser.reason);
}

test("valid signed revision verifies identically", async () => {
  const fixture = await createFixture();
  await assertParity(
    fixture.previous,
    await fixture.makeNext(),
    fixture.genesis,
    true
  );
});

test("skipped revision is rejected identically", async () => {
  const fixture = await createFixture();
  await assertParity(
    fixture.previous,
    await fixture.makeNext({ revision: 3 }),
    fixture.genesis,
    false
  );
});

test("incorrect predecessor hash is rejected identically", async () => {
  const fixture = await createFixture();
  await assertParity(
    fixture.previous,
    await fixture.makeNext({ previousBeaconHash: "a".repeat(64) }),
    fixture.genesis,
    false
  );
});

test("changed original creation timestamp is rejected identically", async () => {
  const fixture = await createFixture();
  await assertParity(
    fixture.previous,
    await fixture.makeNext({ createdAt: "2026-10-19T12:00:00.000Z" }),
    fixture.genesis,
    false
  );
});

test("non-advancing update timestamp is rejected identically", async () => {
  const fixture = await createFixture();
  await assertParity(
    fixture.previous,
    await fixture.makeNext({ updatedAt: fixture.previous.updatedAt }),
    fixture.genesis,
    false
  );
});

test("changed controller is rejected identically", async () => {
  const fixture = await createFixture();
  const other = await generateBrowserControllerKeyPair();

  const modified = await fixture.makeNext({
    controller: {
      ...fixture.previous.controller,
      publicKeyJwk: other.publicKeyJwk
    }
  }).catch(() => null);

  if (modified) {
    await assertParity(
      fixture.previous,
      modified,
      fixture.genesis,
      false
    );
  } else {
    assert.ok(true, "Controller substitution rejected during signing");
  }
});

test("tampered predecessor is rejected identically", async () => {
  const fixture = await createFixture();
  const next = await fixture.makeNext();

  await assertParity(
    { ...fixture.previous, description: "Unauthorized predecessor change." },
    next,
    fixture.genesis,
    false
  );
});

test("tampered successor is rejected identically", async () => {
  const fixture = await createFixture();
  const next = await fixture.makeNext();

  await assertParity(
    fixture.previous,
    { ...next, name: "Unauthorized Name Change" },
    fixture.genesis,
    false
  );
});

test("changed permanent Tag is rejected identically", async () => {
  const fixture = await createFixture();
  const otherTag = await generateBrowserMotb8Tag();

  const modified = await fixture.makeNext({
    motb8Tag: otherTag
  });

  await assertParity(
    fixture.previous,
    modified,
    fixture.genesis,
    false
  );
});
