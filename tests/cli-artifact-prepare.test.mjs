import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, existsSync, rmSync, writeFileSync, mkdirSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  prepareArtifactDirectory
} from "../dist/cli/artifacts/prepare.js";

test("creates a new artifact output directory", () => {
  const parent = mkdtempSync(join(tmpdir(), "motb8-prepare-"));
  const target = join(parent, "machine-one");

  try {
    const paths = prepareArtifactDirectory(target);

    assert.equal(paths.root, target);
    assert.equal(existsSync(target), true);
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});

test("rejects an existing artifact directory", () => {
  const parent = mkdtempSync(join(tmpdir(), "motb8-existing-"));

  try {
    assert.throws(
      () => prepareArtifactDirectory(parent),
      /Artifact destination already exists/
    );
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});

test("rejects an existing artifact file", () => {
  const parent = mkdtempSync(join(tmpdir(), "motb8-file-"));
  const target = join(parent, "existing-file");

  try {
    writeFileSync(target, "synthetic test data");

    assert.throws(
      () => prepareArtifactDirectory(target),
      /Artifact destination already exists/
    );
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});


test("rejects an existing symbolic-link destination", (t) => {
  const parent = mkdtempSync(join(tmpdir(), "motb8-link-"));
  const target = join(parent, "actual-directory");
  const link = join(parent, "linked-directory");

  try {
    mkdirSync(target);

    try {
      symlinkSync(target, link, "junction");
    } catch (error) {
      t.skip("Symbolic-link creation unavailable");
      return;
    }

    assert.throws(() => prepareArtifactDirectory(link));
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});

test("rejects a junction in the parent directory", (t) => {
  const parent = mkdtempSync(join(tmpdir(), "motb8-parent-"));
  const actual = join(parent, "actual");
  const linked = join(parent, "linked");

  try {
    mkdirSync(actual);

    try {
      symlinkSync(actual, linked, "junction");
    } catch {
      t.skip("Junction creation unavailable");
      return;
    }

    assert.throws(() =>
      prepareArtifactDirectory(join(linked, "machine-one"))
    );
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});

test("creates separate public and private directories", () => {
  const parent = mkdtempSync(join(tmpdir(), "motb8-separate-"));

  try {
    const paths = prepareArtifactDirectory(
      join(parent, "machine-one")
    );

    assert.equal(existsSync(paths.publicDir), true);
    assert.equal(existsSync(paths.privateDir), true);
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});
