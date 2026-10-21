import type { BeaconProfiles } from "./types.js";

export function createBeaconProfiles(
  input: BeaconProfiles
): BeaconProfiles {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Invalid profile input");
  }

  const allowed = new Set([
    "developers",
    "organizations",
    "links"
  ]);

  for (const field of Object.keys(input)) {
    if (!allowed.has(field)) {
      throw new Error(`Unexpected profile field: ${field}`);
    }
  }

  const validName = (value: unknown): value is string =>
    typeof value === "string" &&
    value.length >= 1 &&
    value.length <= 160;

  for (const field of ["developers", "organizations"] as const) {
    const values = input[field];

    if (values === undefined) continue;

    if (
      !Array.isArray(values) ||
      !values.every(validName) ||
      new Set(values).size !== values.length
    ) {
      throw new Error(`Invalid profile ${field}`);
    }
  }

  if (input.links !== undefined) {
    if (!Array.isArray(input.links)) {
      throw new Error("Invalid profile links");
    }

    for (const link of input.links) {
      if (!link || typeof link !== "object" ||
          Array.isArray(link)) {
        throw new Error("Invalid profile link");
      }

      const allowedLinkFields = new Set([
        "type", "url", "label"
      ]);

      for (const field of Object.keys(link)) {
        if (!allowedLinkFields.has(field)) {
          throw new Error(`Unexpected profile link field: ${field}`);
        }
      }

      if (!validName(link.type) ||
          link.type.length > 100 ||
          typeof link.url !== "string" ||
          link.url.length > 2048 ||
          !URL.canParse(link.url)) {
        throw new Error("Invalid profile link fields");
      }

      if (link.label !== undefined && !validName(link.label)) {
        throw new Error("Invalid profile link label");
      }
    }
  }

  return {
    ...(input.developers !== undefined
      ? { developers: [...input.developers] } : {}),
    ...(input.organizations !== undefined
      ? { organizations: [...input.organizations] } : {}),
    ...(input.links !== undefined
      ? { links: input.links.map(link => ({ ...link })) } : {})
  };
}
