import assert from "node:assert/strict";
import { test } from "node:test";
import { createPublicKey } from "node:crypto";

import { generateMotb8Tag } from "../dist/tag/generate.js";
import { generateControllerKeyPair } from "../dist/genesis/controller.js";
import { createGenesisRecord } from "../dist/genesis/create.js";
import { encryptControlFile } from "../dist/control/encrypt.js";
import { unlockControlFile } from "../dist/control/unlock.js";

const passphrase = "temporary-test-passphrase-2026";

function createFixture() {
  const tag = generateMotb8Tag();
  const controller = generateControllerKeyPair();

  const genesis = createGenesisRecord(
    tag,
    controller.publicKeyJwk,
    controller.privateKey
  );

  const file = encryptControlFile(
    tag,
    controller.privateKey,
    passphrase
  );

  return { tag, controller, genesis, file };
}

test("Control File unlocks with matching Genesis controller", () => {
  const { genesis, file } = createFixture();
  const recovered = unlockControlFile(file, passphrase, genesis);
  const publicJwk = createPublicKey(recovered).export({ format: "jwk" });

  assert.equal(publicJwk.x, genesis.controller.publicKeyJwk.x);
});

test("Control File rejects unrelated Genesis Tag", () => {
  const { controller, file } = createFixture();

  const otherGenesis = createGenesisRecord(
    generateMotb8Tag(),
    controller.publicKeyJwk,
    controller.privateKey
  );

  assert.throws(
    () => unlockControlFile(file, passphrase, otherGenesis),
    /Tag mismatch/
  );
});

test("Control File rejects mismatched Genesis controller", () => {
  const { tag, file } = createFixture();
  const otherController = generateControllerKeyPair();

  const conflictingGenesis = createGenesisRecord(
    tag,
    otherController.publicKeyJwk,
    otherController.privateKey
  );

  assert.throws(
    () => unlockControlFile(file, passphrase, conflictingGenesis),
    /Recovered controller does not match Genesis/
  );
});

test("Genesis-bound unlock rejects incorrect passphrase", () => {
  const { genesis, file } = createFixture();

  assert.throws(
    () => unlockControlFile(file, "incorrect-passphrase", genesis)
  );
});

test("Genesis-bound unlock rejects tampered Genesis", () => {
  const { genesis, file } = createFixture();
  const tampered = {
    ...genesis,
    createdAt: "2020-01-01T00:00:00Z"
  };

  assert.throws(
    () => unlockControlFile(file, passphrase, tampered),
    /Genesis verification failed/
  );
});
