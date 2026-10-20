import type { MOTB8BeaconV01 } from "./types.js";

export type DiscoverySummaryInput = Pick<
  MOTB8BeaconV01,
  "name" | "presenceScope" | "presenceType" | "description"
>;

export function generateDiscoverySummary(
  input: DiscoverySummaryInput
): string {
  if (
    !input ||
    typeof input !== "object" ||
    typeof input.name !== "string" ||
    typeof input.description !== "string"
  ) {
    throw new Error("Invalid discovery summary input");
  }

  const name = input.name.trim();
  const scope = input.presenceScope;
  const type = input.presenceType;
  const description = input.description.trim();

  if (!name || !description) {
    throw new Error("Discovery summary requires name and description");
  }

  return `${name} | ${scope} ${type} | ${description}`;
}
