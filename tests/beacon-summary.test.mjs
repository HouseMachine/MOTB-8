import assert from "node:assert/strict";
import { test } from "node:test";
import { generateDiscoverySummary } from "../dist/beacon/summary.js";

const input = {
  name: "Atlas Research",
  presenceScope: "single",
  presenceType: "agent",
  description: "Autonomous research and information analysis system."
};

test("discovery summary follows canonical v0.1 format", () => {
  assert.equal(
    generateDiscoverySummary(input),
    "Atlas Research | single agent | Autonomous research and information analysis system."
  );
});

test("discovery summary is deterministic", () => {
  assert.equal(
    generateDiscoverySummary(input),
    generateDiscoverySummary({ ...input })
  );
});

test("discovery summary trims surrounding whitespace", () => {
  const modified = {
    ...input,
    name: "  Atlas Research  ",
    description: "  Autonomous research and information analysis system.  "
  };

  assert.equal(
    generateDiscoverySummary(modified),
    generateDiscoverySummary(input)
  );
});

test("discovery summary rejects missing name or description", () => {
  assert.throws(
    () => generateDiscoverySummary({ ...input, name: "" }),
    /requires name and description/
  );

  assert.throws(
    () => generateDiscoverySummary({ ...input, description: "" }),
    /requires name and description/
  );
});

test("discovery summary rejects malformed input types", () => {
  const invalidCases = [
    null,
    undefined,
    {},
    { ...input, name: 123 },
    { ...input, name: null },
    { ...input, description: 456 },
    { ...input, description: null }
  ];

  for (const invalid of invalidCases) {
    assert.throws(
      () => generateDiscoverySummary(invalid),
      /Invalid discovery summary input/
    );
  }
});
