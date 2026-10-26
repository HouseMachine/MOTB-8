import assert from "node:assert/strict";

import {
  beaconV10,
  beaconV11
} from "../src/browser/generated/beacon-validators.cjs";

console.log("Beacon v1.0 validator:", typeof beaconV10);
console.log("Beacon v1.1 validator:", typeof beaconV11);

assert.equal(typeof beaconV10, "function");
assert.equal(typeof beaconV11, "function");

const invalidRecord = {
  schemaVersion: "1.0",
  name: "Incomplete machine"
};

assert.equal(beaconV10(invalidRecord), false);
assert.equal(beaconV11(invalidRecord), false);

console.log("Generated validators load and reject incomplete records.");
