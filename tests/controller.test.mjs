import assert from "node:assert/strict";
import { test } from "node:test";
import { sign, verify } from "node:crypto";
import { generateControllerKeyPair } from "../dist/genesis/controller.js";

test("Ed25519 controller generates a valid public JWK", () => {
  const controller = generateControllerKeyPair();

  assert.equal(controller.publicKeyJwk.kty, "OKP");
  assert.equal(controller.publicKeyJwk.crv, "Ed25519");
  assert.match(controller.publicKeyJwk.x, /^[A-Za-z0-9_-]{43}$/);
  assert.equal("d" in controller.publicKeyJwk, false);
});

test("controller signs and verifies a message", () => {
  const controller = generateControllerKeyPair();
  const message = Buffer.from("MOTB-8 controller verification test");

  const signature = sign(null, message, controller.privateKey);

  assert.equal(verify(null, message, controller.publicKey, signature), true);
  assert.equal(
    verify(null, Buffer.from("tampered message"), controller.publicKey, signature),
    false
  );
});

test("different controllers cannot impersonate each other", () => {
  const controllerA = generateControllerKeyPair();
  const controllerB = generateControllerKeyPair();

  const message = Buffer.from("MOTB-8 controller verification test");
  const signature = sign(null, message, controllerA.privateKey);

  assert.equal(verify(null, message, controllerB.publicKey, signature), false);
});
