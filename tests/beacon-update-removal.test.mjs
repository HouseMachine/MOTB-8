import test from "node:test";
import assert from "node:assert/strict";

import { applyBeaconChanges } from "../dist/presence/apply-changes.js";

const previous = {
  name: "Research Machine",
  description: "A synthetic machine for testing Beacon updates.",
  presenceScope: "composite",
  presenceType: "other",
  representedSystemCount: 3,
  customPresenceType: "Research Cluster",
  capabilities: [{ id: "research", name: "Research" }],
  taxonomy: [{ domain: "Technology", category: "AI" }]
};

test("removes optional fields explicitly set to null", () => {
  const result = applyBeaconChanges(previous, {
    capabilities: null,
    taxonomy: null,
    representedSystemCount: null,
    customPresenceType: null,
    presenceScope: "single",
    presenceType: "agent"
  });

  assert.equal(Object.hasOwn(result, "capabilities"), false);
  assert.equal(Object.hasOwn(result, "taxonomy"), false);
  assert.equal(Object.hasOwn(result, "representedSystemCount"), false);
  assert.equal(Object.hasOwn(result, "customPresenceType"), false);
  assert.equal(result.presenceScope, "single");
});

test("omitted fields preserve their previous values", () => {
  const result = applyBeaconChanges(previous, {
    name: "Updated Research Machine"
  });

  assert.deepEqual(result.capabilities, previous.capabilities);
  assert.equal(result.name, "Updated Research Machine");
});

test("rejects protected and required field changes", () => {
  assert.throws(
    () => applyBeaconChanges(previous, { motb8Tag: "invalid" }),
    /Protected or unsupported/
  );

  assert.throws(
    () => applyBeaconChanges(previous, { name: null }),
    /Cannot remove required/
  );

  assert.throws(
    () => applyBeaconChanges(previous, { capabilities: undefined }),
    /Undefined Beacon update value/
  );
});
