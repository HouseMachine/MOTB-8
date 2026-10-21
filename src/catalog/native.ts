import type {
  NativeCatalogEntry,
  CatalogDirection
} from "./types.js";

export interface CreateNativeCatalogInput {
  id: string;
  direction: CatalogDirection;
  name: string;
  description: string;
  resourceUrl?: string;
}

function validText(value: unknown, max: number): boolean {
  return typeof value === "string" &&
    value.length >= 1 &&
    value.length <= max;
}

export function createNativeCatalogEntry(
  input: CreateNativeCatalogInput
): NativeCatalogEntry {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Invalid native catalog input");
  }

  const allowed = new Set([
    "id",
    "direction",
    "name",
    "description",
    "resourceUrl"
  ]);

  for (const field of Object.keys(input)) {
    if (!allowed.has(field)) {
      throw new Error(`Unexpected catalog field: ${field}`);
    }
  }

  if (
    !validText(input.id, 160) ||
    !validText(input.name, 160) ||
    !validText(input.description, 500)
  ) {
    throw new Error("Invalid native catalog fields");
  }

  if (input.direction !== "OFFER" && input.direction !== "SEEK") {
    throw new Error("Invalid catalog direction");
  }

  if (input.resourceUrl !== undefined) {
    if (
      !validText(input.resourceUrl, 2048) ||
      !URL.canParse(input.resourceUrl)
    ) {
      throw new Error("Invalid catalog resource URL");
    }
  }

  return {
    id: input.id,
    direction: input.direction,
    name: input.name,
    description: input.description,
    ...(input.resourceUrl !== undefined
      ? { resourceUrl: input.resourceUrl }
      : {})
  };
}
