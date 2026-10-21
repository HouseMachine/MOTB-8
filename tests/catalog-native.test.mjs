import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createNativeCatalogEntry
} from "../dist/catalog/native.js";

test("creates a native OFFER catalog entry", () => {
  const entry = createNativeCatalogEntry({
    id: "research-service",
    direction: "OFFER",
    name: "Research Service",
    description: "Provides research and analytical services."
  });

  assert.equal(entry.direction, "OFFER");
  assert.equal(entry.id, "research-service");
  assert.equal(entry.resourceUrl, undefined);
});

test("creates a native SEEK catalog entry with resource URL", () => {
  const entry = createNativeCatalogEntry({
    id: "compute-resource",
    direction: "SEEK",
    name: "Compute Resource",
    description: "Seeking additional computing capacity.",
    resourceUrl: "https://example.org/compute"
  });

  assert.equal(entry.direction, "SEEK");
  assert.equal(entry.resourceUrl, "https://example.org/compute");
});

test("rejects invalid native catalog direction", () => {
  assert.throws(() =>
    createNativeCatalogEntry({
      id: "invalid-direction",
      direction: "UNKNOWN",
      name: "Invalid Direction",
      description: "This direction must not be accepted."
    })
  );
});

test("rejects missing required native catalog fields", () => {
  assert.throws(() =>
    createNativeCatalogEntry({
      id: "",
      direction: "OFFER",
      name: "",
      description: ""
    })
  );
});

test("rejects invalid native catalog resource URL", () => {
  assert.throws(() =>
    createNativeCatalogEntry({
      id: "invalid-url",
      direction: "OFFER",
      name: "Invalid URL",
      description: "This entry contains an invalid URL.",
      resourceUrl: "not-a-valid-url"
    })
  );
});

test("rejects unexpected native catalog fields", () => {
  assert.throws(() =>
    createNativeCatalogEntry({
      id: "research-service",
      direction: "OFFER",
      name: "Research Service",
      description: "Provides research and analytical services.",
      unauthorizedField: "unexpected"
    })
  );
});

test("rejects native catalog fields exceeding schema limits", () => {
  const valid = {
    id: "research",
    direction: "OFFER",
    name: "Research Service",
    description: "Provides research and analytical services."
  };

  assert.throws(() =>
    createNativeCatalogEntry({
      ...valid,
      id: "x".repeat(161)
    })
  );

  assert.throws(() =>
    createNativeCatalogEntry({
      ...valid,
      name: "x".repeat(161)
    })
  );

  assert.throws(() =>
    createNativeCatalogEntry({
      ...valid,
      description: "x".repeat(501)
    })
  );

  assert.throws(() =>
    createNativeCatalogEntry({
      ...valid,
      resourceUrl: "https://example.org/" + "x".repeat(2048)
    })
  );
});

test("accepts valid non-HTTP resource URIs", () => {
  const entry = createNativeCatalogEntry({
    id: "machine-resource",
    direction: "OFFER",
    name: "Machine Resource",
    description: "Provides a machine-readable resource.",
    resourceUrl: "urn:example:machine-resource"
  });

  assert.equal(
    entry.resourceUrl,
    "urn:example:machine-resource"
  );
});
