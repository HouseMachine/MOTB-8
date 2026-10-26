import test from "node:test";
import assert from "node:assert/strict";

import {
  generateBrowserMotb8Tag,
  computeBrowserTagChecksum,
  isValidBrowserMotb8Tag
} from "../dist/browser/index.js";

import {
  parseMotb8Tag,
  computeTagChecksum
} from "../dist/index.js";

test("browser checksums match canonical vectors", async () => {
  assert.equal(
    await computeBrowserTagChecksum("0".repeat(32)),
    "6S"
  );

  assert.equal(
    await computeBrowserTagChecksum("Z".repeat(32)),
    "JF"
  );
});

test("browser-generated Tags pass core verification", async () => {
  for (let i = 0; i < 100; i++) {
    const tag = await generateBrowserMotb8Tag();
    const parsed = parseMotb8Tag(tag);

    assert.equal(parsed.canonicalTag, tag);
    assert.equal(await isValidBrowserMotb8Tag(tag), true);
    assert.equal(
      await computeBrowserTagChecksum(parsed.payload),
      computeTagChecksum(parsed.payload)
    );
  }
});

test("browser validator rejects malformed Tags", async () => {
  const tag = await generateBrowserMotb8Tag();

  assert.equal(
    await isValidBrowserMotb8Tag(tag.replace("MOTB-8", "MOTB-9")),
    false
  );

  assert.equal(
    await isValidBrowserMotb8Tag(tag.slice(0, -1)),
    false
  );
});
