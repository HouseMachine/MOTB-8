import test from "node:test";
import assert from "node:assert/strict";

import {
  createPresence,
  validateBeaconStructure
} from "../dist/index.js";

import {
  beaconV10,
  beaconV11
} from "../src/browser/generated/beacon-validators.cjs";

const registration = {
  name: "MOTB-8 Compatibility Machine",
  presenceScope: "single",
  presenceType: "agent",
  description: "A test machine for browser and core schema compatibility.",
  goodFaith: {
    acknowledged: true,
    termsVersion: "1.0",
    acknowledgedAt: "2026-10-25T00:00:00.000Z"
  }
};

function makeBeacon() {
  return createPresence({
    registration,
    passphrase: "test-only-passphrase-123"
  }).beacon;
}

test("valid Beacon v1.0 matches core validation", () => {
  const beacon = makeBeacon();

  assert.equal(validateBeaconStructure(beacon), true);
  assert.equal(beaconV10(beacon), true);
  assert.equal(beaconV11(beacon), false);
});

test("valid Beacon v1.1 matches core validation", () => {
  const beacon = {
    ...makeBeacon(),
    schemaVersion: "1.1",
    revision: 1
  };

  assert.equal(validateBeaconStructure(beacon), true);
  assert.equal(beaconV11(beacon), true);
  assert.equal(beaconV10(beacon), false);
});

test("invalid Beacon fields are rejected consistently", () => {
  const valid = makeBeacon();

  const cases = [
    { ...valid, description: "Too short" },
    { ...valid, presenceType: "invalid-type" },
    { ...valid, unexpectedField: true },
    { ...valid, goodFaith: { ...valid.goodFaith, acknowledged: false } },
    { ...valid, profiles: { links: [{ type: "website", url: "not a uri" }] } }
  ];

  for (const candidate of cases) {
    assert.equal(validateBeaconStructure(candidate), false);
    assert.equal(beaconV10(candidate), false);
  }
});

test("Beacon v1.1 revision rules match core validation", () => {
  const base = {
    ...makeBeacon(),
    schemaVersion: "1.1",
    revision: 1
  };

  const invalid = {
    ...base,
    revision: 2
  };

  assert.equal(validateBeaconStructure(invalid), false);
  assert.equal(beaconV11(invalid), false);
});
