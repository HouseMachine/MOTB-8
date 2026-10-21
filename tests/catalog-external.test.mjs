import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createExternalCatalogEntry
} from "../dist/catalog/external.js";

test("creates an external catalog reference", () => {
  const entry = createExternalCatalogEntry({
    url: "https://example.org/catalog",
    label: "Machine Service Catalog",
    format: "application/json"
  });

  assert.equal(entry.url, "https://example.org/catalog");
  assert.equal(entry.label, "Machine Service Catalog");
  assert.equal(entry.format, "application/json");
});

test("accepts a minimal external catalog reference", () => {
  const entry = createExternalCatalogEntry({
    url: "https://example.org/services"
  });

  assert.deepEqual(entry, {
    url: "https://example.org/services"
  });
});

test("accepts a valid non-HTTP catalog URI", () => {
  const entry = createExternalCatalogEntry({
    url: "urn:example:service-catalog"
  });

  assert.equal(entry.url, "urn:example:service-catalog");
});

test("rejects missing or malformed catalog URLs", () => {
  assert.throws(() =>
    createExternalCatalogEntry({})
  );

  assert.throws(() =>
    createExternalCatalogEntry({
      url: "not-a-valid-uri"
    })
  );

  assert.throws(() =>
    createExternalCatalogEntry({
      url: ""
    })
  );
});

test("rejects external catalog fields exceeding limits", () => {
  const url = "https://example.org/catalog";

  assert.throws(() =>
    createExternalCatalogEntry({
      url,
      label: "x".repeat(161)
    })
  );

  assert.throws(() =>
    createExternalCatalogEntry({
      url,
      format: "x".repeat(101)
    })
  );

  assert.throws(() =>
    createExternalCatalogEntry({
      url: "https://example.org/" + "x".repeat(2048)
    })
  );
});

test("rejects unexpected external catalog properties", () => {
  assert.throws(() =>
    createExternalCatalogEntry({
      url: "https://example.org/catalog",
      unauthorizedField: "unexpected"
    })
  );
});
