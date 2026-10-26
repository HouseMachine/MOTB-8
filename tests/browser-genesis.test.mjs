import test from "node:test";
import assert from "node:assert/strict";

import {
  generateBrowserMotb8Tag,
  generateBrowserControllerKeyPair,
  createBrowserGenesisRecord
} from "../dist/browser/index.js";

import {
  verifyGenesisRecord
} from "../dist/index.js";

test("browser Genesis verifies with MOTB-8 core", async () => {
  const tag = await generateBrowserMotb8Tag();
  const controller = await generateBrowserControllerKeyPair();

  const genesis = await createBrowserGenesisRecord(
    tag,
    controller
  );

  const verification = verifyGenesisRecord(genesis);

  assert.equal(
    verification.status,
    "VALID_UNANCHORED",
    verification.reason
  );
});

test("Genesis binds the Tag to the controller public key", async () => {
  const tag = await generateBrowserMotb8Tag();
  const controller = await generateBrowserControllerKeyPair();

  const genesis = await createBrowserGenesisRecord(
    tag,
    controller
  );

  assert.equal(genesis.motb8Tag, tag);
  assert.equal(
    genesis.controller.publicKeyJwk.x,
    controller.publicKeyJwk.x
  );
});

test("modified Genesis data invalidates its signature", async () => {
  const tag = await generateBrowserMotb8Tag();
  const controller = await generateBrowserControllerKeyPair();

  const genesis = await createBrowserGenesisRecord(
    tag,
    controller
  );

  const modified = {
    ...genesis,
    createdAt: "2020-01-01T00:00:00.000Z"
  };

  assert.equal(
    verifyGenesisRecord(modified).status,
    "INVALID"
  );
});

test("another controller cannot impersonate the Genesis controller", async () => {
  const tag = await generateBrowserMotb8Tag();
  const first = await generateBrowserControllerKeyPair();
  const second = await generateBrowserControllerKeyPair();

  const genesis = await createBrowserGenesisRecord(
    tag,
    first
  );

  const modified = {
    ...genesis,
    controller: {
      ...genesis.controller,
      publicKeyJwk: second.publicKeyJwk
    }
  };

  assert.equal(
    verifyGenesisRecord(modified).status,
    "INVALID"
  );
});
