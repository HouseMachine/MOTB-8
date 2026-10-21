import { readFileSync } from "node:fs";

interface CapabilityVocabulary {
  vocabulary: string;
  version: string;
  source: string;
  sourceVersion: string;
  status: string;
  capabilities: string[];
}

function loadCapabilityVocabulary(): CapabilityVocabulary {
  const file = new URL(
    "../../vocabularies/capabilities/motb8-capabilities-v0.1.json",
    import.meta.url
  );

  return JSON.parse(
    readFileSync(file, "utf8").replace(/^\uFEFF/, "")
  ) as CapabilityVocabulary;
}

const vocabulary = loadCapabilityVocabulary();

export function getReferenceCapabilities(): string[] {
  return [...vocabulary.capabilities];
}

export function isReferenceCapability(
  capability: string
): boolean {
  return vocabulary.capabilities.includes(capability);
}
