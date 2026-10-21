import type { MOTB8BeaconV11 } from "../beacon/types-v1.1.js";

export type BeaconProtocol =
  NonNullable<MOTB8BeaconV11["protocols"]>[number];
