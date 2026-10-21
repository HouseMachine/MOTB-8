import assert from "node:assert/strict";
import { test } from "node:test";
import { join, resolve } from "node:path";

import {
  getRevisionPaths
} from "../dist/cli/artifacts/revision-paths.js";

test("calculates migration revision paths", () => {
  const root = resolve("synthetic-motb8-machine");
  const paths = getRevisionPaths(root);

  assert.equal(
    paths.revisionsDir,
    join(root, "public", "revisions")
  );

  assert.equal(
    paths.legacyBeacon,
    join(root, "public", "revisions", "beacon-v1.0.json")
  );

  assert.equal(
    paths.migratedBeacon,
    join(root, "public", "revisions", "beacon-v1.1-r1.json")
  );
});
