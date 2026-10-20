import assert from "node:assert/strict";
import { test } from "node:test";
import { generateMotb8Tag } from "../dist/tag/generate.js";
import { validateControlFileStructure } from "../dist/control/validate.js";

function makeControlFile() {
  return {
    format: "MOTB-8-CONTROL",
    version: "1.0",
    motb8Tag: generateMotb8Tag(),
    kdf: {
      algorithm: "scrypt",
      N: 32768,
      r: 8,
      p: 1,
      salt: "A".repeat(22)
    },
    encryption: {
      algorithm: "AES-256-GCM",
      nonce: "A".repeat(16),
      authTag: "A".repeat(22)
    },
    ciphertext: "AQIDBAUG"
  };
}

test("valid Control File structure is accepted", () => {
  assert.equal(validateControlFileStructure(makeControlFile()), true);
});

test("invalid MOTB-8 Tag is rejected", () => {
  const file = makeControlFile();
  file.motb8Tag = "invalid-tag";
  assert.equal(validateControlFileStructure(file), false);
});

test("unsupported encryption parameters are rejected", () => {
  const file = makeControlFile();
  file.kdf.N = 1024;
  assert.equal(validateControlFileStructure(file), false);
});

test("malformed nonce is rejected", () => {
  const file = makeControlFile();
  file.encryption.nonce = "bad";
  assert.equal(validateControlFileStructure(file), false);
});

test("missing ciphertext is rejected", () => {
  const file = makeControlFile();
  delete file.ciphertext;
  assert.equal(validateControlFileStructure(file), false);
});

test("unexpected fields are rejected", () => {
  const file = makeControlFile();
  file.privateKey = "should-not-be-here";
  assert.equal(validateControlFileStructure(file), false);
});
