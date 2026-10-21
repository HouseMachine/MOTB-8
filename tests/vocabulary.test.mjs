import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getIndustryDomains,
  findIndustryDomain,
  findIndustryCategory,
  findIndustrySubcategory
} from "../dist/vocabulary/industry.js";

import {
  getReferenceCapabilities,
  isReferenceCapability
} from "../dist/vocabulary/capabilities.js";

test("reference industry taxonomy contains 33 domains", () => {
  const domains = getIndustryDomains();

  assert.equal(domains.length, 33);
  assert.equal(domains.some(d => d.code === "99"), true);
});

test("reference industry taxonomy contains 225 categories", () => {
  const domains = getIndustryDomains();

  const count = domains.reduce(
    (total, domain) => total + domain.categories.length,
    0
  );

  assert.equal(count, 225);
});

test("reference industry taxonomy contains 1148 subcategories", () => {
  const domains = getIndustryDomains();

  const count = domains.reduce(
    (total, domain) =>
      total + domain.categories.reduce(
        (sum, category) => sum + category.subcategories.length,
        0
      ),
    0
  );

  assert.equal(count, 1148);
});

test("industry domain lookup supports code and key", () => {
  const domain = findIndustryDomain("12");

  assert.ok(domain);
  assert.equal(
    domain.label,
    "Artificial Intelligence & Machine Intelligence"
  );

  assert.deepEqual(findIndustryDomain(domain.key), domain);
});

test("industry category and subcategory lookup works", () => {
  const domain = findIndustryDomain("12");
  assert.ok(domain);

  const category = domain.categories.find(
    item => item.label === "Autonomous Agents"
  );

  assert.ok(category);

  const foundCategory = findIndustryCategory(
    domain.key,
    category.key
  );

  assert.deepEqual(foundCategory, category);

  const subcategory = category.subcategories.find(
    item => item.label === "Multi-Agent Systems"
  );

  assert.ok(subcategory);

  assert.deepEqual(
    findIndustrySubcategory(
      domain.key,
      category.key,
      subcategory.key
    ),
    subcategory
  );
});

test("unknown industry classifications return undefined", () => {
  assert.equal(
    findIndustryDomain("independent-custom-domain"),
    undefined
  );
});

test("industry lookup returns independent copies", () => {
  const first = getIndustryDomains();
  const second = getIndustryDomains();

  first[0].label = "Modified Label";

  assert.notEqual(first[0].label, second[0].label);
});

test("reference capability vocabulary contains 40 identifiers", () => {
  const capabilities = getReferenceCapabilities();

  assert.equal(capabilities.length, 40);
  assert.equal(new Set(capabilities).size, 40);
});

test("known reference capabilities are recognized", () => {
  assert.equal(isReferenceCapability("RESEARCH"), true);
  assert.equal(isReferenceCapability("AUTOMATION"), true);
  assert.equal(isReferenceCapability("GATEWAY"), true);
});

test("custom capabilities are not part of the reference vocabulary", () => {
  assert.equal(
    isReferenceCapability("CUSTOM_AUTONOMOUS_CAPABILITY"),
    false
  );
});
