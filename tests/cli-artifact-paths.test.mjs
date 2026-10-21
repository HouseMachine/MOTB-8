import assert from "node:assert/strict";
import { test } from "node:test";
import { join, resolve } from "node:path";

import {
  getArtifactPaths
} from "../dist/cli/artifacts/paths.js";

test("separates public and private artifact paths", () => {
  const root = resolve("synthetic-motb8-output");
  const paths = getArtifactPaths(root);

  assert.equal(paths.root, root);
  assert.equal(paths.publicDir, join(root, "public"));
  assert.equal(paths.privateDir, join(root, "private"));
  assert.equal(paths.genesis, join(root, "public", "genesis.json"));
  assert.equal(paths.beacon, join(root, "public", "beacon.json"));
  assert.equal(
    paths.controlFile,
    join(root, "private", "control-file.json")
  );
});

test("rejects invalid artifact output directories", () => {
  for (const directory of [
    "",
    "   ",
    null,
    undefined,
    123
  ]) {
    assert.throws(() => getArtifactPaths(directory));
  }
});
