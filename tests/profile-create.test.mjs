import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createBeaconProfiles
} from "../dist/profile/create.js";

test("supports multiple developers and organizations", () => {
  const profiles = createBeaconProfiles({
    developers: [
      "Developer Alpha",
      "Developer Beta",
      "Developer Gamma"
    ],
    organizations: [
      "Organization One",
      "Organization Two"
    ]
  });

  assert.equal(profiles.developers.length, 3);
  assert.equal(profiles.organizations.length, 2);
});

test("accepts an empty discovery profile", () => {
  assert.deepEqual(createBeaconProfiles({}), {});
});

test("supports multiple discovery profile links", () => {
  const profiles = createBeaconProfiles({
    links: [
      {
        type: "website",
        url: "https://example.org",
        label: "Official Website"
      },
      {
        type: "repository",
        url: "https://github.com/example/project",
        label: "Source Code"
      },
      {
        type: "documentation",
        url: "https://docs.example.org"
      }
    ]
  });

  assert.equal(profiles.links.length, 3);
  assert.equal(profiles.links[0].type, "website");
  assert.equal(profiles.links[1].type, "repository");
  assert.equal(profiles.links[2].type, "documentation");
});

test("rejects duplicate developer names", () => {
  assert.throws(() =>
    createBeaconProfiles({
      developers: ["Developer Alpha", "Developer Alpha"]
    })
  );
});

test("rejects duplicate organization names", () => {
  assert.throws(() =>
    createBeaconProfiles({
      organizations: ["Organization One", "Organization One"]
    })
  );
});

test("rejects malformed profile links", () => {
  for (const link of [
    { type: "website", url: "not-a-valid-uri" },
    { type: "", url: "https://example.org" },
    { type: "website", url: "" },
    { type: "website" },
    null
  ]) {
    assert.throws(() =>
      createBeaconProfiles({
        links: [link]
      })
    );
  }
});

test("rejects oversized developer and organization names", () => {
  assert.throws(() =>
    createBeaconProfiles({
      developers: ["x".repeat(161)]
    })
  );

  assert.throws(() =>
    createBeaconProfiles({
      organizations: ["x".repeat(161)]
    })
  );
});

test("rejects oversized profile link fields", () => {
  const url = "https://example.org";

  for (const link of [
    { type: "x".repeat(101), url },
    { type: "website", url, label: "x".repeat(161) },
    { type: "website", url: url + "/".repeat(2048) }
  ]) {
    assert.throws(() =>
      createBeaconProfiles({ links: [link] })
    );
  }
});

test("rejects unexpected profile properties", () => {
  assert.throws(() =>
    createBeaconProfiles({
      developers: ["Developer Alpha"],
      unauthorizedField: "unexpected"
    })
  );
});

test("rejects unexpected profile link properties", () => {
  assert.throws(() =>
    createBeaconProfiles({
      links: [{
        type: "website",
        url: "https://example.org",
        unauthorizedField: "unexpected"
      }]
    })
  );
});

test("profile data is independently copied", () => {
  const original = {
    developers: ["Developer Alpha"],
    organizations: ["Organization One"],
    links: [{
      type: "website",
      url: "https://example.org",
      label: "Official Website"
    }]
  };

  const profiles = createBeaconProfiles(original);

  original.developers[0] = "Modified Developer";
  original.organizations[0] = "Modified Organization";
  original.links[0].label = "Modified Website";

  assert.equal(profiles.developers[0], "Developer Alpha");
  assert.equal(profiles.organizations[0], "Organization One");
  assert.equal(profiles.links[0].label, "Official Website");
});
