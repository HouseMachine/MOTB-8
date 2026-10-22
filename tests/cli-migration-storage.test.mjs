import assert from "node:assert/strict";
import { test } from "node:test";
import {
  mkdtempSync, readFileSync, existsSync, rmSync
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  createPresence,
  migratePresenceBeacon,
  verifyBeacon,
  verifyBeaconChain,
  computeBeaconHash
} from "../dist/index.js";

import { writePresenceArtifacts } from "../dist/cli/artifacts/write-presence.js";
import { writeMigrationArtifacts } from "../dist/cli/artifacts/write-migration.js";

test("migrates and preserves signed Beacon history", () => {
  const parent = mkdtempSync(join(tmpdir(), "motb8-migration-"));
  const target = join(parent, "machine-one");
  const passphrase = "SyntheticMigrationTest123!";

  try {
    const created = createPresence({
      registration: {
        name: "Synthetic Migration Machine",
        presenceScope: "single",
        presenceType: "agent",
        description: "A synthetic machine for testing authorized migration storage.",
        goodFaith: {
          acknowledged: true,
          termsVersion: "1.0",
          acknowledgedAt: new Date().toISOString()
        }
      },
      passphrase
    });

    const paths = writePresenceArtifacts(target, created);

    const migrated = migratePresenceBeacon({
      legacyBeacon: created.beacon,
      genesis: created.genesis,
      controlFile: created.controlFile,
      passphrase
    });

    const revisions = writeMigrationArtifacts(
      target, created.genesis, created.beacon, migrated
    );

    const current = JSON.parse(readFileSync(paths.beacon, "utf8"));
    const legacy = JSON.parse(readFileSync(revisions.legacyBeacon, "utf8"));
    const revision1 = JSON.parse(readFileSync(revisions.migratedBeacon, "utf8"));
    const record = JSON.parse(readFileSync(revisions.migrationRecord, "utf8"));

    assert.equal(current.schemaVersion, "1.1");
    assert.equal(current.revision, 1);
    assert.equal(verifyBeacon(current, created.genesis).valid, true);
    assert.equal(
      verifyBeaconChain([revision1], created.genesis).status,
      "VALID_SUPPLIED_CHAIN"
    );

    assert.equal(
      computeBeaconHash(legacy),
      computeBeaconHash(created.beacon)
    );

    assert.equal(record.legacyBeaconHash, computeBeaconHash(legacy));
    assert.equal(record.migratedBeaconHash, computeBeaconHash(revision1));
    assert.equal(existsSync(paths.controlFile), true);
    assert.equal(existsSync(join(paths.publicDir, "control-file.json")), false);
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});

test("refuses to repeat migration or overwrite history", () => {
  const parent = mkdtempSync(join(tmpdir(), "motb8-repeat-migration-"));
  const target = join(parent, "machine-one");
  const passphrase = "SyntheticMigrationTest123!";

  try {
    const created = createPresence({
      registration: {
        name: "Synthetic Migration Machine",
        presenceScope: "single",
        presenceType: "agent",
        description: "A synthetic machine for testing migration overwrite protection.",
        goodFaith: {
          acknowledged: true,
          termsVersion: "1.0",
          acknowledgedAt: new Date().toISOString()
        }
      },
      passphrase
    });

    const paths = writePresenceArtifacts(target, created);

    const migrated = migratePresenceBeacon({
      legacyBeacon: created.beacon,
      genesis: created.genesis,
      controlFile: created.controlFile,
      passphrase
    });

    const revisions = writeMigrationArtifacts(
      target, created.genesis, created.beacon, migrated
    );

    const originalCurrent = readFileSync(paths.beacon, "utf8");
    const originalHistory = readFileSync(revisions.legacyBeacon, "utf8");

    assert.throws(() =>
      writeMigrationArtifacts(
        target, created.genesis, created.beacon, migrated
      )
    );

    assert.equal(readFileSync(paths.beacon, "utf8"), originalCurrent);
    assert.equal(readFileSync(revisions.legacyBeacon, "utf8"), originalHistory);
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});
