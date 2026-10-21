import type { MOTB8BeaconV11 } from "../beacon/types-v1.1.js";

export type BeaconProfiles =
  NonNullable<MOTB8BeaconV11["profiles"]>;

export type BeaconProfileLink =
  NonNullable<BeaconProfiles["links"]>[number];
