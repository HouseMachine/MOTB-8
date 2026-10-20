import assert from "node:assert/strict";
import { test } from "node:test";

import {
  validateBeaconStructure,
  validateUnsignedBeaconStructure
} from "../dist/beacon/validate.js";

import { generateMotb8Tag } from "../dist/tag/generate.js";
import { generateControllerKeyPair } from "../dist/genesis/controller.js";
import { generateDiscoverySummary } from "../dist/beacon/summary.js";

function makeBeacon(version = "1.0", revision) {
  const controller = generateControllerKeyPair();
  const timestamp = "2026-10-20T12:00:00Z";

  const record = {
    schemaVersion: version,
    motb8Tag: generateMotb8Tag(),
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
    discoverySummary: generateDiscoverySummary({
      name: "Atlas Research",
      presenceScope: "single",
      presenceType: "agent",
      description: "Autonomous research and information analysis system."
    }),
    proof: {
      type: "Ed25519Signature2026",
      verificationMethod: "#controller-1",
      canonicalization: "RFC8785-JCS",
      signature: "A".repeat(86)
    }
  };

  if (revision !== undefined) {
    record.revision = revision;
  }

  return record;
}

test("version-aware validator accepts v1.0 Beacon", () => {
  assert.equal(validateBeaconStructure(makeBeacon()), true);
});

test("version-aware validator accepts v1.1 initial Beacon", () => {
  assert.equal(validateBeaconStructure(makeBeacon("1.1", 1)), true);
});

test("version-aware validator accepts v1.1 subsequent Beacon", () => {
  const beacon = makeBeacon("1.1", 2);
  beacon.previousBeaconHash = "a".repeat(64);

  assert.equal(validateBeaconStructure(beacon), true);
});

test("version-aware validator rejects unsupported versions", () => {
  assert.equal(validateBeaconStructure(makeBeacon("2.0")), false);
});

test("version-aware validator rejects missing v1.1 revision", () => {
  assert.equal(validateBeaconStructure(makeBeacon("1.1")), false);
});

test("version-aware validator rejects predecessor hash on revision 1", () => {
  const beacon = makeBeacon("1.1", 1);
  beacon.previousBeaconHash = "a".repeat(64);

  assert.equal(validateBeaconStructure(beacon), false);
});

test("unsigned v1.1 Beacon validates without proof", () => {
  const { proof, ...unsigned } = makeBeacon("1.1", 1);

  assert.equal(validateUnsignedBeaconStructure(unsigned), true);
});

test("unsigned validator rejects records containing proof", () => {
  assert.equal(
    validateUnsignedBeaconStructure(makeBeacon("1.1", 1)),
    false
  );
});
