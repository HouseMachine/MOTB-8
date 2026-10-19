import { computeTagChecksum } from "../dist/tag/checksum.js";
import assert from "node:assert/strict";
import { test } from "node:test";
import { generateMotb8Tag } from "../dist/tag/generate.js";
import { parseMotb8Tag, isValidMotb8Tag } from "../dist/tag/parse.js";

test("generated MOTB-8 Tags parse successfully", () => {
  for (let i = 0; i < 100; i++) {
    const tag = generateMotb8Tag();
    const parsed = parseMotb8Tag(tag);

    assert.equal(parsed.canonicalTag, tag);
    assert.equal(parsed.version, 1);
    assert.equal(parsed.payload.length, 32);
    assert.equal(parsed.checksum.length, 2);
    assert.equal(isValidMotb8Tag(tag), true);
  }
});

test("invalid Tag envelopes are rejected", () => {
  const tag = generateMotb8Tag();

  assert.equal(isValidMotb8Tag(tag.replace("([[", "(([")), false);
  assert.equal(isValidMotb8Tag(tag.replace("]])", "]))")), false);
  assert.equal(isValidMotb8Tag(tag.slice(0, -1)), false);
});

test("modified checksums are rejected", () => {
  const tag = generateMotb8Tag();
  const modified = tag.replace(/:([0-9A-HJKMNP-TV-Z]{2})\]\]\)$/, ":XX]])");

  assert.equal(isValidMotb8Tag(modified), false);
});

test("deterministic checksum vectors match the specification", () => {
  assert.equal(computeTagChecksum("0".repeat(32)), "6S");
  assert.equal(computeTagChecksum("Z".repeat(32)), "JF");
});

test("invalid payload characters and malformed Tags are rejected", () => {
  const valid = generateMotb8Tag();

  assert.equal(isValidMotb8Tag(valid.replace("MOTB-8", "MOTB-9")), false);
  assert.equal(isValidMotb8Tag(valid.replace(":1:", ":2:")), false);
  assert.equal(isValidMotb8Tag(valid.toLowerCase()), false);
  assert.equal(isValidMotb8Tag(valid.slice(0, -1)), false);

  assert.throws(() => computeTagChecksum("O".repeat(32)));
  assert.throws(() => computeTagChecksum("I".repeat(32)));
});

test("generated identity payloads are distinct in a sample", () => {
  const tags = new Set();

  for (let i = 0; i < 1000; i++) {
    tags.add(generateMotb8Tag());
  }

  assert.equal(tags.size, 1000);
});

