import assert from "node:assert/strict";
import { test } from "node:test";

import { generateMotb8Tag } from "../dist/tag/generate.js";
import { generateControllerKeyPair } from "../dist/genesis/controller.js";
import { createGenesisRecord } from "../dist/genesis/create.js";
import { signBeacon } from "../dist/beacon/sign.js";
import { verifyBeacon } from "../dist/beacon/verify.js";

function createFixture() {
  const controller = generateControllerKeyPair();
  const tag = generateMotb8Tag();
  const genesis = createGenesisRecord(
    tag,
    controller.publicKeyJwk,
    controller.privateKey
  );

  const timestamp = new Date().toISOString();

  const unsigned = {
    schemaVersion: "1.0",
    motb8Tag: tag,
    name: "Atlas Research",
    presenceScope: "single",
    presenceType: "agent",
    description: "Autonomous research and information analysis system.",
    goodFaith: {
      acknowledged: true,
      termsVersion: "1.0",
      acknowledgedAt: timestamp
    },
    status: "active",
    createdAt: timestamp,
    updatedAt: timestamp,
    controller: {
      id: "#controller-1",
      type: "Ed25519",
      publicKeyJwk: controller.publicKeyJwk
    },
    discoverySummary: "Atlas Research | single agent | autonomous research and information analysis system"
  };

  return {
    controller,
    genesis,
    beacon: signBeacon(unsigned, controller.privateKey)
  };
}

test("valid signed Beacon verifies against Genesis", () => {
  const { beacon, genesis } = createFixture();
  const result = verifyBeacon(beacon, genesis);

  assert.equal(result.valid, true);
  assert.equal(result.genesisStatus, "VALID_UNANCHORED");
});

test("Beacon content tampering invalidates signature", () => {
  const { beacon, genesis } = createFixture();
  const modified = {
    ...beacon,
    description: "Unauthorized modification of the machine description."
  };

  assert.equal(verifyBeacon(modified, genesis).valid, false);
});

test("Beacon with a different Tag is rejected", () => {
  const { beacon, genesis } = createFixture();
  const modified = {
    ...beacon,
    motb8Tag: generateMotb8Tag()
  };

  assert.equal(verifyBeacon(modified, genesis).valid, false);
});

test("Beacon with a different controller is rejected", () => {
  const { beacon, genesis } = createFixture();
  const other = generateControllerKeyPair();

  const modified = structuredClone(beacon);
  modified.controller.publicKeyJwk = other.publicKeyJwk;

  assert.equal(verifyBeacon(modified, genesis).valid, false);
});

test("Beacon proof metadata tampering is rejected", () => {
  const { beacon, genesis } = createFixture();
  const modified = structuredClone(beacon);

  modified.proof.verificationMethod = "#unknown-controller";

  assert.equal(verifyBeacon(modified, genesis).valid, false);
});

test("Beacon signed by another controller cannot claim Genesis authority", () => {
  const { beacon, genesis } = createFixture();
  const attacker = generateControllerKeyPair();

  const forgedUnsigned = {
    ...beacon,
    controller: {
      id: "#controller-1",
      type: "Ed25519",
      publicKeyJwk: attacker.publicKeyJwk
    }
  };

  delete forgedUnsigned.proof;

  const forged = signBeacon(forgedUnsigned, attacker.privateKey);

  assert.equal(verifyBeacon(forged, genesis).valid, false);
});

test("invalid Genesis prevents Beacon verification", () => {
  const { beacon, genesis } = createFixture();
  const modifiedGenesis = {
    ...genesis,
    createdAt: "2020-01-01T00:00:00Z"
  };

  const result = verifyBeacon(beacon, modifiedGenesis);

  assert.equal(result.valid, false);
  assert.equal(result.genesisStatus, "INVALID");
});

test("signBeacon rejects malformed unsigned Beacon data", () => {
  const { controller, beacon } = createFixture();
  const { proof, ...unsigned } = beacon;

  const invalidCases = [
    { ...unsigned, description: "Short" },
    { ...unsigned, goodFaith: { ...unsigned.goodFaith, acknowledged: false } },
    { ...unsigned, presenceScope: "composite" },
    { ...unsigned, presenceType: "other" },
    { ...unsigned, status: "unverified" },
    { ...unsigned, unknownField: "not permitted" }
  ];

  for (const invalid of invalidCases) {
    assert.throws(
      () => signBeacon(invalid, controller.privateKey),
      /Invalid unsigned Beacon structure/
    );
  }
});

test("signBeacon rejects mismatched controller private keys", () => {
  const { beacon } = createFixture();
  const other = generateControllerKeyPair();
  const { proof, ...unsigned } = beacon;

  assert.throws(
    () => signBeacon(unsigned, other.privateKey),
    /Beacon controller key mismatch/
  );
});
