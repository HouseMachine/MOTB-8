import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import { generateMotb8Tag } from "../dist/tag/generate.js";
import { generateControllerKeyPair } from "../dist/genesis/controller.js";
import { signBeacon } from "../dist/beacon/sign.js";
import { generateDiscoverySummary } from "../dist/beacon/summary.js";

function loadSchema(filename) {
  return JSON.parse(
    readFileSync(
      new URL(`../schemas/${filename}`, import.meta.url),
      "utf8"
    ).replace(/^\uFEFF/, "")
  );
}

const ajv = new Ajv2020.default({ allErrors: true });
addFormats.default(ajv);

const validateV10 = ajv.compile(loadSchema("beacon.schema.json"));
const validateV11 = ajv.compile(loadSchema("beacon-v1.1.schema.json"));

function makeLegacyBeacon() {
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

function makeV11Beacon(revision = 1) {
  const legacy = makeLegacyBeacon();

  return {
    ...legacy,
    schemaVersion: "1.1",
    revision,
    ...(revision > 1
      ? { previousBeaconHash: "a".repeat(64) }
      : {})
  };
}

test("legacy v1.0 Beacon remains structurally valid", () => {
  assert.equal(validateV10(makeLegacyBeacon()), true);
});

test("v1.1 initial revision passes structural validation", () => {
  assert.equal(validateV11(makeV11Beacon(1)), true);
});

test("v1.1 subsequent revision with hash passes", () => {
  assert.equal(validateV11(makeV11Beacon(2)), true);
});

test("revision 1 rejects predecessor hash", () => {
  const beacon = makeV11Beacon(1);
  beacon.previousBeaconHash = "a".repeat(64);

  assert.equal(validateV11(beacon), false);
});

test("revision 2 requires predecessor hash", () => {
  const beacon = makeV11Beacon(2);
  delete beacon.previousBeaconHash;

  assert.equal(validateV11(beacon), false);
});

test("revision zero is rejected", () => {
  assert.equal(validateV11(makeV11Beacon(0)), false);
});

test("malformed predecessor hash is rejected", () => {
  const beacon = makeV11Beacon(2);
  beacon.previousBeaconHash = "invalid";

  assert.equal(validateV11(beacon), false);
});

test("v1.1 schema rejects legacy version declaration", () => {
  const beacon = makeV11Beacon(1);
  beacon.schemaVersion = "1.0";

  assert.equal(validateV11(beacon), false);
});

test("legacy v1.0 schema rejects revision metadata", () => {
  assert.equal(validateV10(makeV11Beacon(1)), false);
});
