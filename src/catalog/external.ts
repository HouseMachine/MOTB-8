import type { ExternalCatalogEntry } from "./types.js";

export function createExternalCatalogEntry(
  input: ExternalCatalogEntry
): ExternalCatalogEntry {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Invalid external catalog input");
  }

  const allowed = new Set(["url", "label", "format"]);

  for (const field of Object.keys(input)) {
    if (!allowed.has(field)) {
      throw new Error(`Unexpected external catalog field: ${field}`);
    }
  }

  if (
    typeof input.url !== "string" ||
    input.url.length > 2048 ||
    !URL.canParse(input.url)
  ) {
    throw new Error("Invalid external catalog URL");
  }

  if (
    input.label !== undefined &&
    (typeof input.label !== "string" ||
      input.label.length < 1 ||
      input.label.length > 160)
  ) {
    throw new Error("Invalid external catalog label");
  }

  if (
    input.format !== undefined &&
    (typeof input.format !== "string" ||
      input.format.length > 100)
  ) {
    throw new Error("Invalid external catalog format");
  }

  return {
    url: input.url,
    ...(input.label !== undefined ? { label: input.label } : {}),
    ...(input.format !== undefined ? { format: input.format } : {})
  };
}
