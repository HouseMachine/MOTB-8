import test from "node:test";
import assert from "node:assert/strict";

import {
  generateBrowserMotb8Tag,
  generateBrowserControllerKeyPair,
  createBrowserGenesisRecord,
  signBrowserBeacon
} from "../dist/browser/index.js";

import {
  verifyBeacon,
  generateDiscoverySummary
} from "../dist/index.js";

async function makeRecords(version = "1.0") {
  const tag = await generateBrowserMotb8Tag();
  const controller = await generateBrowserControllerKeyPair();
  const timestamp = new Date().toISOString();

  const genesis = await createBrowserGenesisRecord(
    tag, controller, timestamp
  );

  const registration = {
    name: "Browser Beacon Compatibility Machine",
    presenceScope: "single",
    presenceType: "agent",
    description: "A machine used to verify browser and core Beacon interoperability.",
    goodFaith: {
      acknowledged: true,
      termsVersion: "1.0",
      acknowledgedAt: timestamp
    }
  };

  const unsigned = {
    ...registration,
    schemaVersion: version,
    motb8Tag: tag,
    status: "active",
    createdAt: timestamp,
    updatedAt: timestamp,
    controller: genesis.controller,
    discoverySummary: generateDiscoverySummary(registration),
    ...(version === "1.1" ? { revision: 1 } : {})
  };

  const beacon = await signBrowserBeacon(unsigned, controller);

  return { beacon, genesis, controller };
}

test("browser Beacon v1.0 verifies with core", async () => {
  const { beacon, genesis } = await makeRecords("1.0");
  const result = verifyBeacon(beacon, genesis);

  assert.equal(result.valid, true, result.reason);
  assert.equal(result.genesisStatus, "VALID_UNANCHORED");
});

test("browser Beacon v1.1 verifies with core", async () => {
  const { beacon, genesis } = await makeRecords("1.1");
  const result = verifyBeacon(beacon, genesis);

  assert.equal(result.valid, true, result.reason);
  assert.equal(result.genesisStatus, "VALID_UNANCHORED");
});

test("modified Beacon content invalidates signature", async () => {
  const { beacon, genesis } = await makeRecords();

  const modified = {
    ...beacon,
    description: "This description has been changed after signing."
  };

  assert.equal(verifyBeacon(modified, genesis).valid, false);
});

test("another controller cannot sign for the original controller", async () => {
  const { beacon, controller } = await makeRecords();
  const other = await generateBrowserControllerKeyPair();

  await assert.rejects(
    signBrowserBeacon(
      (({ proof, ...unsigned }) => unsigned)(beacon),
      other
    ),
    /controller key mismatch/
  );

  assert.notEqual(
    controller.publicKeyJwk.x,
    other.publicKeyJwk.x
  );
});

test("invalid Beacon structure is rejected before signing", async () => {
  const { beacon, controller } = await makeRecords();

  const { proof, ...unsigned } = beacon;

  await assert.rejects(
    signBrowserBeacon(
      { ...unsigned, description: "short" },
      controller
    ),
    /Invalid unsigned Beacon structure/
  );
});
