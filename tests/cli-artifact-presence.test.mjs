import assert from "node:assert/strict";
import { test } from "node:test";
import {
  mkdtempSync,
  readFileSync,
  existsSync,
  rmSync
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { createPresence, verifyBeacon } from "../dist/index.js";
import { writePresenceArtifacts } from "../dist/cli/artifacts/write-presence.js";

test("writes complete MOTB-8 presence artifacts", () => {
  const parent = mkdtempSync(join(tmpdir(), "motb8-presence-write-"));

  try {
    const presence = createPresence({
      registration: {
        name: "Synthetic Publishing Machine",
        presenceScope: "single",
        presenceType: "agent",
        description: "A synthetic machine for testing portable artifact creation.",
        goodFaith: {
          acknowledged: true,
          termsVersion: "1.0",
          acknowledgedAt: new Date().toISOString()
        }
      },
      passphrase: "SyntheticTestPassphrase123!"
    });

    const paths = writePresenceArtifacts(
      join(parent, "machine-one"),
      presence
    );

    assert.equal(existsSync(paths.genesis), true);
    assert.equal(existsSync(paths.beacon), true);
    assert.equal(existsSync(paths.controlFile), true);

    const genesis = JSON.parse(readFileSync(paths.genesis, "utf8"));
    const beacon = JSON.parse(readFileSync(paths.beacon, "utf8"));
    const control = JSON.parse(readFileSync(paths.controlFile, "utf8"));

    assert.equal(verifyBeacon(beacon, genesis).valid, true);
    assert.equal(control.motb8Tag, presence.tag);
    assert.equal(existsSync(join(paths.publicDir, "control-file.json")), false);
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});

test("refuses to overwrite an existing machine presence", () => {
  const parent = mkdtempSync(join(tmpdir(), "motb8-presence-existing-"));
  const target = join(parent, "machine-one");

  try {
    const presence = createPresence({
      registration: {
        name: "Synthetic Publishing Machine",
        presenceScope: "single",
        presenceType: "agent",
        description: "A synthetic machine for testing overwrite protection.",
        goodFaith: {
          acknowledged: true,
          termsVersion: "1.0",
          acknowledgedAt: new Date().toISOString()
        }
      },
      passphrase: "SyntheticTestPassphrase123!"
    });

    writePresenceArtifacts(target, presence);

    assert.throws(
      () => writePresenceArtifacts(target, presence),
      /Artifact destination already exists/
    );

    assert.equal(existsSync(join(target, "public", "genesis.json")), true);
    assert.equal(existsSync(join(target, "private", "control-file.json")), true);
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});

test("removes partial artifacts after Beacon writing fails", () => {
  const parent = mkdtempSync(join(tmpdir(), "motb8-presence-rollback-"));
  const target = join(parent, "machine-one");

  try {
    const presence = {
      genesis: { synthetic: true },
      beacon: { invalid: BigInt(123) },
      controlFile: { synthetic: true }
    };

    assert.throws(() =>
      writePresenceArtifacts(target, presence)
    );

    assert.equal(existsSync(target), false);
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});
