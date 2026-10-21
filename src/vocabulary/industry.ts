import { readFileSync } from "node:fs";

export interface IndustrySubcategory {
  key: string;
  label: string;
}

export interface IndustryCategory {
  key: string;
  label: string;
  subcategories: IndustrySubcategory[];
}

export interface IndustryDomain {
  code: string;
  key: string;
  label: string;
  categories: IndustryCategory[];
}

interface IndustryVocabulary {
  source: string;
  sourceVersion: string;
  status: string;
  domains: IndustryDomain[];
}

function loadIndustryVocabulary(): IndustryVocabulary {
  const file = new URL(
    "../../vocabularies/industry/motb8-industry-v0.1.json",
    import.meta.url
  );

  return JSON.parse(
    readFileSync(file, "utf8").replace(/^\uFEFF/, "")
  ) as IndustryVocabulary;
}

const vocabulary = loadIndustryVocabulary();

export function getIndustryDomains(): IndustryDomain[] {
  return structuredClone(vocabulary.domains);
}

export function findIndustryDomain(
  keyOrCode: string
): IndustryDomain | undefined {
  const domain = vocabulary.domains.find(
    item => item.key === keyOrCode || item.code === keyOrCode
  );

  return domain ? structuredClone(domain) : undefined;
}

export function findIndustryCategory(
  domainKeyOrCode: string,
  categoryKey: string
): IndustryCategory | undefined {
  const domain = findIndustryDomain(domainKeyOrCode);

  return domain?.categories.find(
    item => item.key === categoryKey
  );
}

export function findIndustrySubcategory(
  domainKeyOrCode: string,
  categoryKey: string,
  subcategoryKey: string
): IndustrySubcategory | undefined {
  const category = findIndustryCategory(
    domainKeyOrCode,
    categoryKey
  );

  return category?.subcategories.find(
    item => item.key === subcategoryKey
  );
}
