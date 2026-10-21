import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createBeaconAttachment
} from "../dist/attachment/create.js";

test("creates a developer-defined attachment", () => {
  const attachment = createBeaconAttachment({
    type: "example.robotics.sensor-profile",
    version: "1.0",
    data: {
      sensors: ["camera", "lidar"],
      environment: "outdoor"
    }
  });

  assert.equal(attachment.type, "example.robotics.sensor-profile");
  assert.equal(attachment.version, "1.0");
  assert.deepEqual(attachment.data.sensors, ["camera", "lidar"]);
});

test("accepts an empty attachment data object", () => {
  const attachment = createBeaconAttachment({
    type: "example.empty",
    version: "1.0",
    data: {}
  });

  assert.deepEqual(attachment.data, {});
});

test("attachment data is independently copied", () => {
  const original = {
    type: "example.sensor",
    version: "1.0",
    data: { status: "active" }
  };

  const attachment = createBeaconAttachment(original);
  original.data.status = "modified";

  assert.equal(attachment.data.status, "active");
});

test("rejects missing required attachment fields", () => {
  assert.throws(() =>
    createBeaconAttachment({
      type: "",
      version: "1.0",
      data: {}
    })
  );

  assert.throws(() =>
    createBeaconAttachment({
      type: "example.sensor",
      version: "",
      data: {}
    })
  );
});

test("rejects invalid attachment data types", () => {
  for (const data of [null, [], "text", 123]) {
    assert.throws(() =>
      createBeaconAttachment({
        type: "example.sensor",
        version: "1.0",
        data
      })
    );
  }
});

test("rejects non-JSON attachment values", () => {
  for (const value of [
    undefined,
    BigInt(123),
    () => "invalid",
    new Date()
  ]) {
    assert.throws(() =>
      createBeaconAttachment({
        type: "example.invalid",
        version: "1.0",
        data: { value }
      })
    );
  }
});

test("rejects circular attachment data", () => {
  const data = {};
  data.self = data;

  assert.throws(() =>
    createBeaconAttachment({
      type: "example.circular",
      version: "1.0",
      data
    })
  );
});

test("rejects excessively nested attachment data", () => {
  let data = {};

  for (let i = 0; i < 40; i++) {
    data = { nested: data };
  }

  assert.throws(() =>
    createBeaconAttachment({
      type: "example.deep",
      version: "1.0",
      data
    })
  );
});

test("rejects attachment data exceeding node limits", () => {
  const data = {
    values: Array.from({ length: 10001 }, (_, i) => i)
  };

  assert.throws(() =>
    createBeaconAttachment({
      type: "example.large",
      version: "1.0",
      data
    })
  );
});

test("rejects accessor properties in attachment data", () => {
  const data = {};

  Object.defineProperty(data, "secret", {
    enumerable: true,
    get() {
      return "unexpected";
    }
  });

  assert.throws(() =>
    createBeaconAttachment({
      type: "example.accessor",
      version: "1.0",
      data
    })
  );
});

test("rejects symbol-keyed attachment properties", () => {
  const data = {
    status: "active",
    [Symbol("hidden")]: "unexpected"
  };

  assert.throws(() =>
    createBeaconAttachment({
      type: "example.symbol",
      version: "1.0",
      data
    })
  );
});

test("rejects oversized attachment JSON payloads", () => {
  assert.throws(() =>
    createBeaconAttachment({
      type: "example.large-payload",
      version: "1.0",
      data: {
        content: "x".repeat(300000)
      }
    })
  );
});

test("rejects sparse arrays in attachment data", () => {
  const values = new Array(3);
  values[0] = "first";

  assert.throws(() =>
    createBeaconAttachment({
      type: "example.sparse",
      version: "1.0",
      data: { values }
    })
  );
});

test("rejects non-finite JSON numbers", () => {
  for (const value of [NaN, Infinity, -Infinity]) {
    assert.throws(() =>
      createBeaconAttachment({
        type: "example.number",
        version: "1.0",
        data: { value }
      })
    );
  }
});
