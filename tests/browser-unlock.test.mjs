import test from "node:test";
import assert from "node:assert/strict";

import {
  generateBrowserMotb8Tag,
  generateBrowserControllerKeyPair,
  createBrowserGenesisRecord,
  encryptBrowserControlFile,
  unlockBrowserControlFile
} from "../dist/browser/index.js";

const PASSPHRASE = "MOTB8-test-only-passphrase-2026";

async function setup() {
  const tag = await generateBrowserMotb8Tag();
  const controller = await generateBrowserControllerKeyPair();
  const genesis = await createBrowserGenesisRecord(tag, controller);
  const file = await encryptBrowserControlFile(
    tag,
    controller,
    PASSPHRASE
  );

  return { tag, controller, genesis, file };
}

test("matching Control File and Genesis unlock successfully", async () => {
  const { controller, genesis, file } = await setup();

  const key = await unlockBrowserControlFile(
    file,
    PASSPHRASE,
    genesis
  );

  assert.equal(key.type, "private");
  assert.equal(key.algorithm.name, "Ed25519");
  assert.equal(key.extractable, false);

  const message = new TextEncoder().encode(
    "MOTB-8 authorized browser signing"
  );

  const signature = await crypto.subtle.sign(
    "Ed25519",
    key,
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

test("incorrect passphrase prevents unlocking", async () => {
  const { genesis, file } = await setup();

  await assert.rejects(
    unlockBrowserControlFile(
      file,
      "incorrect-passphrase",
      genesis
    )
  );
});

test("unrelated Genesis Tag prevents unlocking", async () => {
  const { file } = await setup();

  const otherTag = await generateBrowserMotb8Tag();
  const otherController = await generateBrowserControllerKeyPair();
  const otherGenesis = await createBrowserGenesisRecord(
    otherTag,
    otherController
  );

  await assert.rejects(
    unlockBrowserControlFile(
      file,
      PASSPHRASE,
      otherGenesis
    ),
    /Tag mismatch/
  );
});

test("different Genesis controller prevents unlocking", async () => {
  const { tag, file } = await setup();

  const otherController = await generateBrowserControllerKeyPair();
  const otherGenesis = await createBrowserGenesisRecord(
    tag,
    otherController
  );

  await assert.rejects(
    unlockBrowserControlFile(
      file,
      PASSPHRASE,
      otherGenesis
    ),
    /controller does not match Genesis/
  );
});

test("tampered Genesis prevents unlocking", async () => {
  const { genesis, file } = await setup();

  const tampered = {
    ...genesis,
    createdAt: "2020-01-01T00:00:00.000Z"
  };

  await assert.rejects(
    unlockBrowserControlFile(
      file,
      PASSPHRASE,
      tampered
    ),
    /Genesis verification failed/
  );
});

test("recovered signing key cannot be exported", async () => {
  const { genesis, file } = await setup();

  const key = await unlockBrowserControlFile(
    file,
    PASSPHRASE,
    genesis
  );

  await assert.rejects(
    crypto.subtle.exportKey("pkcs8", key)
  );
});
