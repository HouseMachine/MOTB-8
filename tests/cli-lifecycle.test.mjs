import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  createPresence,
  migratePresenceBeacon,
  updatePresenceBeacon,
  verifyBeaconChain
} from "../dist/index.js";

import { writePresenceArtifacts } from "../dist/cli/artifacts/write-presence.js";
import { writeMigrationArtifacts } from "../dist/cli/artifacts/write-migration.js";
import { writeUpdatedBeacon } from "../dist/cli/artifacts/write-update.js";
import { preparePublishingPackage } from "../dist/cli/publishing/package.js";

test("complete machine lifecycle preserves signed revisions", () => {
  const parent = mkdtempSync(join(tmpdir(), "motb8-lifecycle-"));
  const target = join(parent, "machine-one");
  const passphrase = "SyntheticLifecycleTest123!";

  try {
    const created = createPresence({
      registration: {
        name: "Synthetic Lifecycle Machine",
        presenceScope: "single",
        presenceType: "agent",
        description: "A synthetic machine for testing the complete MOTB-8 lifecycle.",
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

    const updated = updatePresenceBeacon({
      previousBeacon: migrated.beacon,
      genesis: created.genesis,
      controlFile: created.controlFile,
      passphrase,
      changes: {
        description: "An updated synthetic machine with a verified signed revision."
      }
    });

    const saved = writeUpdatedBeacon(
      target, created.genesis, migrated.beacon, updated
    );

    const revision1 = JSON.parse(
      readFileSync(revisions.migratedBeacon, "utf8")
    );

    const revision2 = JSON.parse(
      readFileSync(saved.revision, "utf8")
    );

    const current = JSON.parse(
      readFileSync(paths.beacon, "utf8")
    );

    const chain = verifyBeaconChain(
      [revision1, revision2],
      created.genesis
    );

    assert.equal(chain.status, "VALID_SUPPLIED_CHAIN");
    assert.equal(chain.verifiedRevisions, 2);
    assert.equal(current.revision, 2);
    assert.equal(current.description, updated.beacon.description);
    assert.equal(current.motb8Tag, created.tag);

    const publicationDirectory = join(parent, "publication");

    const publication = preparePublishingPackage(
      target,
      publicationDirectory
    );

    const manifest = publication.manifest;

    assert.equal(manifest.format, "MOTB8_PUBLICATION_PACKAGE");

    const publishedPaths = manifest.files.map(file => file.path);

    assert.equal(publishedPaths.includes("genesis.json"), true);
    assert.equal(publishedPaths.includes("beacon.json"), true);
    assert.equal(
      publishedPaths.includes("revisions/beacon-v1.1-r1.json"),
      true
    );
    assert.equal(
      publishedPaths.includes("revisions/beacon-v1.1-r2.json"),
      true
    );

    assert.equal(
      publishedPaths.some(path => path.includes("control-file")),
      false
    );

    assert.equal(
      existsSync(join(publicationDirectory, "private")),
      false
    );
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});
