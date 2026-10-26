import test from "node:test";
import assert from "node:assert/strict";
import {
  createPrivateKey,
  createPublicKey
} from "node:crypto";

import {
  generateBrowserMotb8Tag,
  generateBrowserControllerKeyPair,
  encryptBrowserControlFile,
  decryptBrowserControlFile
} from "../dist/browser/index.js";

import {
  encryptControlFile,
  decryptControlFile,
  validateControlFileStructure
} from "../dist/index.js";

const PASSPHRASE = "MOTB8-test-only-passphrase-2026";

async function setup() {
  const tag = await generateBrowserMotb8Tag();
  const controller = await generateBrowserControllerKeyPair();

  const pkcs8 = await crypto.subtle.exportKey(
    "pkcs8",
    controller.privateKey
  );

  const nodePrivateKey = createPrivateKey({
    key: Buffer.from(pkcs8),
    format: "der",
    type: "pkcs8"
  });

  return { tag, controller, nodePrivateKey };
}

test("browser-encrypted Control File decrypts in Node", async () => {
  const { tag, controller } = await setup();

  const file = await encryptBrowserControlFile(
    tag, controller, PASSPHRASE
  );

  assert.equal(validateControlFileStructure(file), true);

  const recovered = decryptControlFile(file, PASSPHRASE);
  const recoveredJwk = createPublicKey(recovered).export({
    format: "jwk"
  });

  assert.equal(recoveredJwk.x, controller.publicKeyJwk.x);
});

test("Node-encrypted Control File decrypts in browser adapter", async () => {
  const { tag, controller, nodePrivateKey } = await setup();

  const file = encryptControlFile(
    tag, nodePrivateKey, PASSPHRASE
  );

  const recovered = await decryptBrowserControlFile(
    file, PASSPHRASE
  );

  assert.equal(recovered.extractable, false);

  const message = new TextEncoder().encode(
    "MOTB-8 Control File interoperability"
  );

  const signature = await crypto.subtle.sign(
    "Ed25519",
    recovered,
    message
  );

  assert.equal(
    await crypto.subtle.verify(
      "Ed25519",
      controller.publicKey,
      signature,
      message
    ),
    true
  );
});

test("incorrect passphrase is rejected", async () => {
  const { tag, controller } = await setup();

  const file = await encryptBrowserControlFile(
    tag, controller, PASSPHRASE
  );

  await assert.rejects(
    decryptBrowserControlFile(file, "incorrect-passphrase"),
  );
});

test("modified ciphertext is rejected", async () => {
  const { tag, controller } = await setup();

  const file = await encryptBrowserControlFile(
    tag, controller, PASSPHRASE
  );

  const modified = {
    ...file,
    ciphertext:
      (file.ciphertext[0] === "A" ? "B" : "A") +
      file.ciphertext.slice(1)
  };

  await assert.rejects(
    decryptBrowserControlFile(modified, PASSPHRASE)
  );
});

test("modified authentication tag is rejected", async () => {
  const { tag, controller } = await setup();

  const file = await encryptBrowserControlFile(
    tag, controller, PASSPHRASE
  );

  const modified = {
    ...file,
    encryption: {
      ...file.encryption,
      authTag:
        (file.encryption.authTag[0] === "A" ? "B" : "A") +
        file.encryption.authTag.slice(1)
    }
  };

  await assert.rejects(
    decryptBrowserControlFile(modified, PASSPHRASE)
  );
});

test("modified authenticated metadata is rejected", async () => {
  const { tag, controller } = await setup();

  const file = await encryptBrowserControlFile(
    tag, controller, PASSPHRASE
  );

  const modified = {
    ...file,
    kdf: {
      ...file.kdf,
      salt: "A".repeat(22)
    }
  };

  await assert.rejects(
    decryptBrowserControlFile(modified, PASSPHRASE)
  );
});
