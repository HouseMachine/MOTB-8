import assert from "node:assert/strict";
import { test } from "node:test";
import { sign, verify } from "node:crypto";

import { generateMotb8Tag } from "../dist/tag/generate.js";
import { generateControllerKeyPair } from "../dist/genesis/controller.js";
import { encryptControlFile } from "../dist/control/encrypt.js";
import { decryptControlFile } from "../dist/control/decrypt.js";
import { validateControlFileStructure } from "../dist/control/validate.js";

const passphrase = "temporary-test-passphrase-2026";

function createFixture() {
  const controller = generateControllerKeyPair();
  const tag = generateMotb8Tag();
  const file = encryptControlFile(tag, controller.privateKey, passphrase);
  return { controller, tag, file };
}

test("encrypted Control File passes structural validation", () => {
  const { file } = createFixture();

  assert.equal(validateControlFileStructure(file), true);
  assert.equal("privateKey" in file, false);
  assert.equal("passphrase" in file, false);
});

test("encrypted Control File recovers the original controller", () => {
  const { controller, file } = createFixture();
  const recovered = decryptControlFile(file, passphrase);

  const message = Buffer.from("MOTB-8 controller recovery test");
  const signature = sign(null, message, recovered);

  assert.equal(verify(null, message, controller.publicKey, signature), true);
});

test("incorrect passphrase is rejected", () => {
  const { file } = createFixture();

  assert.throws(() =>
    decryptControlFile(file, "incorrect-passphrase-2026")
  );
});

test("ciphertext and authentication tag tampering are rejected", () => {
  const { file } = createFixture();

  for (const field of ["ciphertext", "authTag"]) {
    const modified = structuredClone(file);
    const target = field === "ciphertext" ? modified : modified.encryption;
    const original = target[field];

    target[field] = (original[0] === "A" ? "B" : "A") + original.slice(1);

    assert.throws(() => decryptControlFile(modified, passphrase));
  }
});

test("authenticated metadata tampering is rejected", () => {
  const { file } = createFixture();

  const modifiedTag = structuredClone(file);
  modifiedTag.motb8Tag = generateMotb8Tag();
  assert.throws(() => decryptControlFile(modifiedTag, passphrase));

  const modifiedNonce = structuredClone(file);
  modifiedNonce.encryption.nonce =
    (file.encryption.nonce[0] === "A" ? "B" : "A") +
    file.encryption.nonce.slice(1);

  assert.throws(() => decryptControlFile(modifiedNonce, passphrase));
});

test("each encryption generates fresh salt and nonce", () => {
  const controller = generateControllerKeyPair();
  const tag = generateMotb8Tag();

  const first = encryptControlFile(tag, controller.privateKey, passphrase);
  const second = encryptControlFile(tag, controller.privateKey, passphrase);

  assert.notEqual(first.kdf.salt, second.kdf.salt);
  assert.notEqual(first.encryption.nonce, second.encryption.nonce);
});
