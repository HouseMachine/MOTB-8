import type { MOTB8BeaconV11 } from "../beacon/types-v1.1.js";
import type { GenesisRecord } from "../genesis/create.js";
import type { EncryptedControlFile } from "../control/encrypt.js";

export type BeaconUpdateChanges = Partial<
  Pick<
    MOTB8BeaconV11,
    | "name"
    | "presenceScope"
    | "presenceType"
    | "description"
    | "representedSystemCount"
    | "customPresenceType"
    | "taxonomy"
    | "capabilities"
    | "profiles"
    | "reachability"
    | "catalogs"
    | "protocols"
    | "relationships"
    | "attachments"
  >
>;

export interface UpdatePresenceBeaconInput {
  previousBeacon: MOTB8BeaconV11;
  genesis: GenesisRecord;
  controlFile: EncryptedControlFile;
  passphrase: string;
  changes: BeaconUpdateChanges;
}

export interface UpdatedPresenceBeacon {
  beacon: MOTB8BeaconV11;
  previousBeaconHash: string;
}
