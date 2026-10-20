import assert from "node:assert/strict";
import { test } from "node:test";

import { createPresence } from "../dist/presence/create.js";
import { verifyGenesisRecord } from "../dist/genesis/verify.js";
import { verifyBeacon } from "../dist/beacon/verify.js";
import { unlockControlFile } from "../dist/control/unlock.js";
import { generateDiscoverySummary } from "../dist/beacon/summary.js";

const passphrase = "temporary-presence-test-passphrase-2026";

function makeRegistration() {
  return {
    name: "Atlas Research",
    presenceScope: "single",
    presenceType: "agent",
    description: "Autonomous research and information analysis system.",
    goodFaith: {
      acknowledged: true,
      termsVersion: "1.0",
      acknowledgedAt: new Date().toISOString()
    },
    capabilities: [
      { id: "data-analysis", name: "Data Analysis" }
    ]
  };
}

test("complete machine presence creation produces consistent artifacts", () => {
  const result = createPresence({
    registration: makeRegistration(),
    passphrase
  });

  assert.equal(result.tag, result.genesis.motb8Tag);
  assert.equal(result.tag, result.beacon.motb8Tag);
  assert.equal(result.tag, result.controlFile.motb8Tag);

  assert.equal(result.genesis.createdAt, result.beacon.createdAt);
  assert.equal(result.beacon.createdAt, result.beacon.updatedAt);

  assert.equal(
    result.genesis.controller.publicKeyJwk.x,
    result.beacon.controller.publicKeyJwk.x
  );

  assert.equal(
    result.beacon.discoverySummary,
    generateDiscoverySummary(result.beacon)
  );

  assert.equal(
    verifyGenesisRecord(result.genesis).status,
    "VALID_UNANCHORED"
  );

  assert.equal(
    verifyBeacon(result.beacon, result.genesis).valid,
    true
  );

  const recovered = unlockControlFile(
    result.controlFile,
    passphrase,
    result.genesis
  );

  assert.equal(recovered.asymmetricKeyType, "ed25519");
});

test("creation rejects generated-field overrides", () => {
  const registration = {
    ...makeRegistration(),
    motb8Tag: "unauthorized-override"
  };

  assert.throws(
    () => createPresence({ registration, passphrase }),
    /cannot override generated field/
  );
});

test("creation rejects invalid registration information", () => {
  const registration = {
    ...makeRegistration(),
    description: "Short"
  };

  assert.throws(
    () => createPresence({ registration, passphrase }),
    /Invalid presence registration fields/
  );
});

test("creation rejects missing Good-Faith acknowledgment", () => {
  const registration = {
    ...makeRegistration(),
    goodFaith: {
      acknowledged: false,
      termsVersion: "1.0",
      acknowledgedAt: new Date().toISOString()
    }
  };

  assert.throws(
    () => createPresence({ registration, passphrase }),
    /Invalid presence registration fields/
  );
});

test("creation rejects an insufficient Control File passphrase", () => {
  assert.throws(
    () => createPresence({
      registration: makeRegistration(),
      passphrase: "short"
    }),
    /passphrase must contain at least 12 characters/
  );
});
