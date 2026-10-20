import assert from "node:assert/strict";
import { test } from "node:test";

import { generateMotb8Tag } from "../dist/tag/generate.js";
import { generateControllerKeyPair } from "../dist/genesis/controller.js";
import { createGenesisRecord } from "../dist/genesis/create.js";
import { signBeacon } from "../dist/beacon/sign.js";
import { computeBeaconHash } from "../dist/beacon/hash.js";
import { verifyBeaconChain } from "../dist/beacon/chain.js";
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

  function successor(previous, description, minute) {
    const { proof, ...unsigned } = previous;

    return signBeacon({
      ...unsigned,
      revision: previous.revision + 1,
      previousBeaconHash: computeBeaconHash(previous),
      updatedAt: `2026-10-20T12:${String(minute).padStart(2, "0")}:00.000Z`,
      description,
      discoverySummary: generateDiscoverySummary({
        ...presence,
        description
      })
    }, controller.privateKey);
  }

  const beacon2 = successor(
    beacon1,
    "Autonomous research and evidence analysis system.",
    1
  );

  const beacon3 = successor(
    beacon2,
    "Autonomous research, evidence analysis, and reporting system.",
    2
  );

  return {
    controller,
    genesis,
    beacon1,
    beacon2,
    beacon3,
    successor
  };
}

test("complete three-revision chain is valid", () => {
  const f = createFixture();
  const result = verifyBeaconChain(
    [f.beacon1, f.beacon2, f.beacon3],
    f.genesis
  );

  assert.equal(result.status, "VALID_SUPPLIED_CHAIN");
  assert.equal(result.valid, true);
  assert.equal(result.verifiedRevisions, 3);
});

test("unordered chain is reconstructed", () => {
  const f = createFixture();

  assert.equal(
    verifyBeaconChain(
      [f.beacon3, f.beacon1, f.beacon2],
      f.genesis
    ).status,
    "VALID_SUPPLIED_CHAIN"
  );
});

test("missing intermediate revision is incomplete", () => {
  const f = createFixture();

  assert.equal(
    verifyBeaconChain([f.beacon1, f.beacon3], f.genesis).status,
    "INCOMPLETE"
  );
});

test("missing initial revision is incomplete", () => {
  const f = createFixture();

  assert.equal(
    verifyBeaconChain([f.beacon2, f.beacon3], f.genesis).status,
    "INCOMPLETE"
  );
});

test("identical duplicate records are accepted", () => {
  const f = createFixture();

  const result = verifyBeaconChain(
    [f.beacon1, f.beacon2, f.beacon2, f.beacon3],
    f.genesis
  );

  assert.equal(result.status, "VALID_SUPPLIED_CHAIN");
  assert.equal(result.verifiedRevisions, 3);
});

test("conflicting signed successors are detected", () => {
  const f = createFixture();

  const conflicting = f.successor(
    f.beacon1,
    "Autonomous research and alternative information reporting system.",
    1
  );

  const result = verifyBeaconChain(
    [f.beacon1, f.beacon2, conflicting],
    f.genesis
  );

  assert.equal(result.status, "CONFLICTING");
  assert.equal(result.valid, false);
});

test("tampered Beacon invalidates supplied chain", () => {
  const f = createFixture();

  const tampered = {
    ...f.beacon2,
    description: "Unauthorized modification of the Beacon."
  };

  assert.equal(
    verifyBeaconChain(
      [f.beacon1, tampered, f.beacon3],
      f.genesis
    ).status,
    "INVALID"
  );
});

test("invalid Genesis invalidates supplied chain", () => {
  const f = createFixture();

  const tamperedGenesis = {
    ...f.genesis,
    createdAt: "2020-01-01T00:00:00.000Z"
  };

  assert.equal(
    verifyBeaconChain(
      [f.beacon1, f.beacon2],
      tamperedGenesis
    ).status,
    "INVALID"
  );
});

test("empty revision history is incomplete", () => {
  const f = createFixture();

  assert.equal(
    verifyBeaconChain([], f.genesis).status,
    "INCOMPLETE"
  );
});

test("non-array revision input is incomplete", () => {
  const f = createFixture();

  assert.equal(
    verifyBeaconChain({}, f.genesis).status,
    "INCOMPLETE"
  );
});

test("initial Beacon creation timestamp must match Genesis", () => {
  const f = createFixture();

  const altered = createGenesisRecord(
    f.beacon1.motb8Tag,
    f.controller.publicKeyJwk,
    f.controller.privateKey,
    "2026-10-19T12:00:00.000Z"
  );

  const result = verifyBeaconChain(
    [f.beacon1],
    altered
  );

  assert.equal(result.status, "INVALID");
  assert.match(result.reason, /creation timestamps differ/);
  assert.equal(result.verifiedRevisions, 0);
});

test("initial Beacon update timestamp must equal creation timestamp", () => {
  const f = createFixture();

  const { proof, ...unsigned } = f.beacon1;

  const altered = signBeacon({
    ...unsigned,
    updatedAt: "2026-10-20T12:01:00.000Z"
  }, f.controller.privateKey);

  const result = verifyBeaconChain(
    [altered],
    f.genesis
  );

  assert.equal(result.status, "INVALID");
  assert.match(result.reason, /update timestamp must equal creation timestamp/);
  assert.equal(result.verifiedRevisions, 0);
});

test("incomplete chain counts only verified revisions", () => {
  const f = createFixture();

  const result = verifyBeaconChain(
    [f.beacon1, f.beacon3],
    f.genesis
  );

  assert.equal(result.status, "INCOMPLETE");
  assert.equal(result.verifiedRevisions, 1);
});

test("revision chain accepts 1000 supplied records", () => {
  const f = createFixture();

  const records = Array(1000).fill(f.beacon1);

  const result = verifyBeaconChain(records, f.genesis);

  assert.equal(result.status, "VALID_SUPPLIED_CHAIN");
  assert.equal(result.valid, true);
  assert.equal(result.verifiedRevisions, 1);
});

test("revision chain rejects more than 1000 supplied records", () => {
  const f = createFixture();

  const records = Array(1001).fill({ invalid: true });

  const result = verifyBeaconChain(records, f.genesis);

  assert.equal(result.status, "INVALID");
  assert.equal(result.valid, false);
  assert.match(
    result.reason,
    /exceeds maximum supported record count/
  );
  assert.equal(result.verifiedRevisions, 0);
});
