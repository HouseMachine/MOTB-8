import assert from "node:assert/strict";
import { test } from "node:test";

import { generateMotb8Tag } from "../dist/tag/generate.js";
import { generateControllerKeyPair } from "../dist/genesis/controller.js";
import { createGenesisRecord } from "../dist/genesis/create.js";
import { verifyBeacon } from "../dist/beacon/verify.js";
import { generateDiscoverySummary } from "../dist/beacon/summary.js";
import { encryptControlFile } from "../dist/control/encrypt.js";
import { signAuthorizedBeacon } from "../dist/control/sign-authorized.js";

const passphrase = "temporary-signing-test-passphrase-2026";

function createFixture() {
  const controller = generateControllerKeyPair();
  const tag = generateMotb8Tag();
  const timestamp = "2026-10-20T12:00:00.000Z";

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

  const unsignedBeacon = {
    schemaVersion: "1.1",
    motb8Tag: tag,
    ...presence,
    revision: 1,
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

  const controlFile = encryptControlFile(
    tag,
    controller.privateKey,
    passphrase
  );

  return { controller, genesis, unsignedBeacon, controlFile };
}

function authorizedSign(fixture, overrides = {}) {
  return signAuthorizedBeacon({
    unsignedBeacon: fixture.unsignedBeacon,
    genesis: fixture.genesis,
    controlFile: fixture.controlFile,
    passphrase,
    ...overrides
  });
}

test("authorized signing returns a valid signed v1.1 Beacon", () => {
  const fixture = createFixture();
  const beacon = authorizedSign(fixture);

  assert.equal(beacon.schemaVersion, "1.1");
  assert.equal(beacon.revision, 1);
  assert.equal(verifyBeacon(beacon, fixture.genesis).valid, true);
});

test("authorized signing rejects incorrect passphrase", () => {
  const fixture = createFixture();

  assert.throws(() => authorizedSign(fixture, {
    passphrase: "incorrect-passphrase"
  }));
});

test("authorized signing rejects unrelated Genesis identity", () => {
  const fixture = createFixture();
  const otherTag = generateMotb8Tag();

  const otherGenesis = createGenesisRecord(
    otherTag,
    fixture.controller.publicKeyJwk,
    fixture.controller.privateKey
  );

  assert.throws(
    () => authorizedSign(fixture, { genesis: otherGenesis }),
    /Beacon and Genesis Tag mismatch/
  );
});

test("authorized signing rejects invalid unsigned Beacon", () => {
  const fixture = createFixture();

  assert.throws(
    () => authorizedSign(fixture, {
      unsignedBeacon: {
        ...fixture.unsignedBeacon,
        description: "Short"
      }
    }),
    /Invalid unsigned Beacon structure/
  );
});

test("authorized signing rejects mismatched controller credentials", () => {
  const fixture = createFixture();
  const otherController = generateControllerKeyPair();

  const unrelatedFile = encryptControlFile(
    fixture.unsignedBeacon.motb8Tag,
    otherController.privateKey,
    passphrase
  );

  assert.throws(
    () => authorizedSign(fixture, {
      controlFile: unrelatedFile
    }),
    /Recovered controller does not match Genesis/
  );
});
