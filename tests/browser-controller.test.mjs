import test from "node:test";
import assert from "node:assert/strict";
import {
  createPrivateKey,
  createPublicKey,
  verify
} from "node:crypto";

import {
  generateBrowserControllerKeyPair
} from "../dist/browser/index.js";

test("browser controller generates Ed25519 keys", async () => {
  const controller = await generateBrowserControllerKeyPair();

  assert.equal(controller.publicKey.algorithm.name, "Ed25519");
  assert.equal(controller.privateKey.algorithm.name, "Ed25519");
  assert.equal(controller.publicKeyJwk.kty, "OKP");
  assert.equal(controller.publicKeyJwk.crv, "Ed25519");
  assert.match(controller.publicKeyJwk.x, /^[A-Za-z0-9_-]{43}$/);
});

test("browser signatures verify with Node crypto", async () => {
  const controller = await generateBrowserControllerKeyPair();

  const message = new TextEncoder().encode(
    "MOTB-8 browser controller compatibility"
  );

  const signature = await crypto.subtle.sign(
    "Ed25519",
    controller.privateKey,
    message
  );

  const publicKey = createPublicKey({
    key: controller.publicKeyJwk,
    format: "jwk"
  });

  assert.equal(
    verify(null, Buffer.from(message), publicKey, Buffer.from(signature)),
    true
  );
});

test("browser PKCS8 private key imports into Node", async () => {
  const controller = await generateBrowserControllerKeyPair();

  const pkcs8 = await crypto.subtle.exportKey(
    "pkcs8",
    controller.privateKey
  );

  const privateKey = createPrivateKey({
    key: Buffer.from(pkcs8),
    format: "der",
    type: "pkcs8"
  });

  const jwk = privateKey.export({ format: "jwk" });

  assert.equal(privateKey.asymmetricKeyType, "ed25519");
  assert.equal(jwk.x, controller.publicKeyJwk.x);
});

test("independent controllers have different public keys", async () => {
  const first = await generateBrowserControllerKeyPair();
  const second = await generateBrowserControllerKeyPair();

  assert.notEqual(first.publicKeyJwk.x, second.publicKeyJwk.x);
});
