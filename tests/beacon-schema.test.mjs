import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { generateMotb8Tag } from "../dist/tag/generate.js";

const schema = JSON.parse(
  readFileSync("./schemas/beacon.schema.json", "utf8").replace(/^\uFEFF/, "")
);

const ajv = new Ajv2020.default({ allErrors: true });
addFormats.default(ajv);
const validate = ajv.compile(schema);

function makeBeacon() {
  return {
    schemaVersion: "1.0",
    motb8Tag: generateMotb8Tag(),
    name: "Atlas Research",
    presenceScope: "single",
    presenceType: "agent",
    description: "Autonomous research and information analysis system.",
    goodFaith: {
      acknowledged: true,
      termsVersion: "1.0",
      acknowledgedAt: "2026-10-19T12:00:00Z"
    },
    status: "active",
    createdAt: "2026-10-19T12:00:00Z",
    updatedAt: "2026-10-19T12:00:00Z",
    controller: {
      id: "#controller-1",
      type: "Ed25519",
      publicKeyJwk: {
        kty: "OKP",
        crv: "Ed25519",
        x: "A".repeat(43)
      }
    },
    discoverySummary: "Atlas Research | single agent | autonomous research and information analysis system",
    proof: {
      type: "Ed25519Signature2026",
      verificationMethod: "#controller-1",
      canonicalization: "RFC8785-JCS",
      signature: "A".repeat(86)
    }
  };
}

test("minimal Beacon passes structural validation", () => {
  assert.equal(validate(makeBeacon()), true, JSON.stringify(validate.errors));
});

test("composite presence requires representedSystemCount", () => {
  const beacon = makeBeacon();
  beacon.presenceScope = "composite";
  assert.equal(validate(beacon), false);
  beacon.representedSystemCount = 3;
  assert.equal(validate(beacon), true);
});

test("other presence type requires customPresenceType", () => {
  const beacon = makeBeacon();
  beacon.presenceType = "other";
  assert.equal(validate(beacon), false);
  beacon.customPresenceType = "Autonomous Scientific Instrument";
  assert.equal(validate(beacon), true);
});

test("Good-Faith acknowledgment must be true", () => {
  const beacon = makeBeacon();
  beacon.goodFaith.acknowledged = false;
  assert.equal(validate(beacon), false);
});

test("short descriptions are rejected", () => {
  const beacon = makeBeacon();
  beacon.description = "Short";
  assert.equal(validate(beacon), false);
});

test("optional discovery sections validate", () => {
  const beacon = makeBeacon();

  beacon.taxonomy = [{ domain: "Technology", category: "Research" }];
  beacon.capabilities = [{ id: "data-analysis", name: "Data Analysis" }];
  beacon.profiles = {
    developers: ["Atlas Team"],
    links: [
      { type: "website", url: "https://atlas.example" },
      { type: "documentation", url: "https://docs.atlas.example" }
    ]
  };
  beacon.reachability = [{ type: "email", value: "hello@atlas.example" }];
  beacon.catalogs = {
    native: [{
      id: "offering-001",
      direction: "OFFER",
      name: "Research Analysis",
      description: "Automated research analysis"
    }]
  };
  beacon.protocols = [{ id: "MCP", version: "1.0" }];
  beacon.relationships = [{ type: "collaborates-with", target: "external-agent-001" }];
  beacon.attachments = [{
    type: "example.telemetry",
    version: "1.0",
    data: { sensorCount: 4 }
  }];

  assert.equal(validate(beacon), true, JSON.stringify(validate.errors));
});

test("unknown attachment types are structurally permitted", () => {
  const beacon = makeBeacon();
  beacon.attachments = [{
    type: "future.example.extension",
    version: "2.0",
    data: { customField: "supported" }
  }];
  assert.equal(validate(beacon), true);
});

test("invalid optional discovery entries are rejected", () => {
  const cases = [
    { taxonomy: [{ domain: "Technology" }] },
    { capabilities: [{ id: "data-analysis" }] },
    { profiles: { links: [{ type: "website", url: "not a valid URL" }] } },
    { reachability: [{ type: "email" }] },
    { catalogs: { native: [{ id: "001", direction: "SELL" }] } },
    { protocols: [{ endpoints: ["https://example.com"] }] },
    { relationships: [{ type: "collaborates-with" }] },
    { attachments: [{ type: "custom", version: "1.0" }] }
  ];

  for (const fields of cases) {
    const beacon = { ...makeBeacon(), ...fields };
    assert.equal(validate(beacon), false, JSON.stringify(fields));
  }
});

test("conditional presence requirements cannot be bypassed", () => {
  const composite = makeBeacon();
  composite.presenceScope = "composite";
  composite.representedSystemCount = 1;
  assert.equal(validate(composite), false);

  const other = makeBeacon();
  other.presenceType = "other";
  other.customPresenceType = "";
  assert.equal(validate(other), false);
});

test("unexpected top-level Beacon fields are rejected", () => {
  const beacon = makeBeacon();
  beacon.unrecognizedField = "not permitted";
  assert.equal(validate(beacon), false);
});
