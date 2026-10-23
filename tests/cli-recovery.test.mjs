import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  createPresence,
  migratePresenceBeacon,
  updatePresenceBeacon
} from "../dist/index.js";

import { writePresenceArtifacts } from "../dist/cli/artifacts/write-presence.js";
import { writeMigrationArtifacts } from "../dist/cli/artifacts/write-migration.js";
import { writeExclusiveJson } from "../dist/cli/artifacts/write-json.js";
import { inspectPresenceRecovery } from "../dist/cli/artifacts/recovery.js";

test("detects current, pending, and locked revision states", () => {
  const parent = mkdtempSync(join(tmpdir(), "motb8-recovery-"));
  const directory = join(parent, "machine-one");
  const passphrase = "SyntheticRecoveryTest123!";

  try {
    const created = createPresence({
      registration: {
        name: "Synthetic Recovery Machine",
        presenceScope: "single",
        presenceType: "agent",
        description: "A disposable machine for testing interrupted update detection.",
        goodFaith: {
          acknowledged: true,
          termsVersion: "1.0",
          acknowledgedAt: new Date().toISOString()
        }
      },
      passphrase
    });

    writePresenceArtifacts(directory, created);

    const migrated = migratePresenceBeacon({
      legacyBeacon: created.beacon,
      genesis: created.genesis,
      controlFile: created.controlFile,
      passphrase
    });

    const revisions = writeMigrationArtifacts(
      directory,
      created.genesis,
      created.beacon,
      migrated
    );

    assert.equal(inspectPresenceRecovery(directory), "CURRENT");

    const updated = updatePresenceBeacon({
      previousBeacon: migrated.beacon,
      genesis: created.genesis,
      controlFile: created.controlFile,
      passphrase,
      changes: {
        description: "A synthetic updated machine awaiting recovery."
      }
    });

    writeExclusiveJson(
      join(revisions.revisionsDir, "beacon-v1.1-r2.json"),
      updated.beacon
    );

    assert.equal(
      inspectPresenceRecovery(directory),
      "PENDING_REVISION"
    );

    writeFileSync(
      join(directory, ".motb8-write.lock"),
      "synthetic-lock",
      { flag: "wx" }
    );

    assert.equal(inspectPresenceRecovery(directory), "LOCKED");
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});

test("unexpected future revision requires manual review", () => {
  const parent = mkdtempSync(join(tmpdir(), "motb8-recovery-extra-"));
  const directory = join(parent, "machine-one");
  const passphrase = "SyntheticRecoveryTest123!";

  try {
    const created = createPresence({
      registration: {
        name: "Synthetic Extra Revision Machine",
        presenceScope: "single",
        presenceType: "agent",
        description: "A disposable machine for testing unexpected revision detection.",
        goodFaith: {
          acknowledged: true,
          termsVersion: "1.0",
          acknowledgedAt: new Date().toISOString()
        }
      },
      passphrase
    });

    writePresenceArtifacts(directory, created);

    const migrated = migratePresenceBeacon({
      legacyBeacon: created.beacon,
      genesis: created.genesis,
      controlFile: created.controlFile,
      passphrase
    });

    const revisions = writeMigrationArtifacts(
      directory,
      created.genesis,
      created.beacon,
      migrated
    );

    writeExclusiveJson(
      join(revisions.revisionsDir, "beacon-v1.1-r3.json"),
      { synthetic: true }
    );

    assert.equal(
      inspectPresenceRecovery(directory),
      "MANUAL_REVIEW"
    );
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});
