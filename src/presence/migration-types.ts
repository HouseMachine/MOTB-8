import type { MOTB8BeaconV01 } from "../beacon/types.js";
import type { MOTB8BeaconV11 } from "../beacon/types-v1.1.js";
import type { GenesisRecord } from "../genesis/create.js";
import type { EncryptedControlFile } from "../control/encrypt.js";

export interface MigratePresenceBeaconInput {
  legacyBeacon: MOTB8BeaconV01;
  genesis: GenesisRecord;
  controlFile: EncryptedControlFile;
  passphrase: string;
}

export interface MigratedPresenceBeacon {
  beacon: MOTB8BeaconV11;
  legacyBeaconHash: string;
  migratedAt: string;
}
