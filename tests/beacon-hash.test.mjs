import assert from "node:assert/strict";
import { test } from "node:test";

import { generateMotb8Tag } from "../dist/tag/generate.js";
import { generateControllerKeyPair } from "../dist/genesis/controller.js";
import { signBeacon } from "../dist/beacon/sign.js";
import { generateDiscoverySummary } from "../dist/beacon/summary.js";
import { computeBeaconHash } from "../dist/beacon/hash.js";

function makeBeacon() {
  const controller = generateControllerKeyPair();
  const timestamp = "2026-10-20T12:00:00Z";

  const unsigned = {
    schemaVersion: "1.0",
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
    })
  };

  return signBeacon(unsigned, controller.privateKey);
}

test("Beacon hash is deterministic", () => {
  const beacon = makeBeacon();

  assert.equal(computeBeaconHash(beacon), computeBeaconHash(beacon));
  assert.match(computeBeaconHash(beacon), /^[0-9a-f]{64}$/);
});

test("Beacon hash is independent of JSON property order", () => {
  const beacon = makeBeacon();
  const reordered = Object.fromEntries(
    Object.entries(beacon).reverse()
  );

  assert.equal(computeBeaconHash(beacon), computeBeaconHash(reordered));
});

test("Beacon hash changes when signed content changes", () => {
  const beacon = makeBeacon();
  const modified = {
    ...beacon,
    description: "Modified autonomous research and analysis system."
  };

  assert.notEqual(computeBeaconHash(beacon), computeBeaconHash(modified));
});

test("Beacon hash includes signature proof", () => {
  const beacon = makeBeacon();
  const modified = structuredClone(beacon);

  modified.proof.signature =
    (modified.proof.signature[0] === "A" ? "B" : "A") +
    modified.proof.signature.slice(1);

  assert.notEqual(computeBeaconHash(beacon), computeBeaconHash(modified));
});

test("invalid Beacon structures cannot be hashed", () => {
  assert.throws(
    () => computeBeaconHash({ invalid: true }),
    /Invalid Beacon structure/
  );
});
