import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createPresence,
  migratePresenceBeacon,
  computeBeaconHash
} from "../dist/index.js";

import {
  createMigrationRecord
} from "../dist/cli/migration/record.js";

test("creates an informational migration record", () => {
  const passphrase = "SyntheticMigrationTest123!";

  const created = createPresence({
    registration: {
      name: "Synthetic Migration Machine",
      presenceScope: "single",
      presenceType: "agent",
      description: "A synthetic machine for testing informational migration records.",
      goodFaith: {
        acknowledged: true,
        termsVersion: "1.0",
        acknowledgedAt: new Date().toISOString()
      }
    },
    passphrase
  });

  const migrated = migratePresenceBeacon({
    legacyBeacon: created.beacon,
    genesis: created.genesis,
    controlFile: created.controlFile,
    passphrase
  });

  const record = createMigrationRecord(migrated);

  assert.equal(record.recordType, "MOTB8_BEACON_MIGRATION");
  assert.equal(record.fromSchemaVersion, "1.0");
  assert.equal(record.toSchemaVersion, "1.1");
  assert.equal(record.migratedAt, migrated.migratedAt);

  assert.equal(
    record.legacyBeaconHash,
    computeBeaconHash(created.beacon)
  );

  assert.equal(
    record.migratedBeaconHash,
    computeBeaconHash(migrated.beacon)
  );

  assert.equal(Object.hasOwn(record, "proof"), false);
  assert.equal(Object.hasOwn(record, "signature"), false);
});
