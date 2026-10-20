import type { MOTB8BeaconV01 } from "../beacon/types.js";
import type { GenesisRecord } from "../genesis/create.js";
import type { EncryptedControlFile } from "../control/encrypt.js";

type GeneratedBeaconFields =
  | "schemaVersion"
  | "motb8Tag"
  | "status"
  | "createdAt"
  | "updatedAt"
  | "controller"
  | "discoverySummary"
  | "proof";

export type PresenceRegistration = Omit<
  MOTB8BeaconV01,
  GeneratedBeaconFields
>;

export interface CreatePresenceInput {
  registration: PresenceRegistration;
  passphrase: string;
}

export interface CreatedPresence {
  tag: string;
  genesis: GenesisRecord;
  beacon: MOTB8BeaconV01;
  controlFile: EncryptedControlFile;
}
