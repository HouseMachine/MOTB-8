import type { MOTB8BeaconV11 } from "../beacon/types-v1.1.js";

export type BeaconAttachment =
  NonNullable<MOTB8BeaconV11["attachments"]>[number];
