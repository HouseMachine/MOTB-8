import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createBeaconProtocol
} from "../dist/protocol/create.js";

test("creates a custom protocol declaration", () => {
  const protocol = createBeaconProtocol({
    id: "example.custom-protocol",
    version: "1.0",
    endpoints: [
      "https://example.org/api",
      "wss://example.org/socket"
    ],
    documentation: "https://example.org/docs"
  });

  assert.equal(protocol.id, "example.custom-protocol");
  assert.equal(protocol.endpoints.length, 2);
  assert.equal(protocol.version, "1.0");
});

test("accepts a minimal protocol declaration", () => {
  const protocol = createBeaconProtocol({
    id: "example.minimal"
  });

  assert.deepEqual(protocol, {
    id: "example.minimal"
  });
});

test("rejects invalid protocol identifiers", () => {
  for (const id of ["", "x".repeat(121), null, 123]) {
    assert.throws(() =>
      createBeaconProtocol({ id })
    );
  }
});

test("rejects unexpected protocol properties", () => {
  assert.throws(() =>
    createBeaconProtocol({
      id: "example.protocol",
      unauthorizedField: "unexpected"
    })
  );
});

test("rejects malformed protocol endpoints", () => {
  for (const endpoints of [
    ["not-a-valid-uri"],
    [""],
    [123],
    "https://example.org/api",
    null
  ]) {
    assert.throws(() =>
      createBeaconProtocol({
        id: "example.protocol",
        endpoints
      })
    );
  }
});

test("rejects malformed documentation URI", () => {
  for (const documentation of [
    "",
    "not-a-valid-uri",
    123
  ]) {
    assert.throws(() =>
      createBeaconProtocol({
        id: "example.protocol",
        documentation
      })
    );
  }
});

test("rejects protocol versions exceeding 80 characters", () => {
  assert.throws(() =>
    createBeaconProtocol({
      id: "example.protocol",
      version: "x".repeat(81)
    })
  );
});

test("rejects protocol URIs exceeding 2048 characters", () => {
  const oversizedUri = "https://example.org/" + "x".repeat(2048);

  assert.throws(() =>
    createBeaconProtocol({
      id: "example.protocol",
      endpoints: [oversizedUri]
    })
  );

  assert.throws(() =>
    createBeaconProtocol({
      id: "example.protocol",
      documentation: oversizedUri
    })
  );
});
