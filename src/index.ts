export const MOTB8_NAME = "Machine Open Tag & Beacon";
export const MOTB8_VERSION = "0.1.0";

export { generateMotb8Tag } from "./tag/generate.js";
export { parseMotb8Tag, isValidMotb8Tag } from "./tag/parse.js";
export { computeTagChecksum } from "./tag/checksum.js";

export { generateControllerKeyPair } from "./genesis/controller.js";
export { createGenesisRecord } from "./genesis/create.js";
export { verifyGenesisRecord } from "./genesis/verify.js";

export type { ParsedMotb8Tag } from "./tag/parse.js";
export type { ControllerKeyPair } from "./genesis/controller.js";
export type { GenesisRecord } from "./genesis/create.js";
export type {
  GenesisVerificationStatus,
  GenesisVerificationResult
} from "./genesis/verify.js";

export { signBeacon } from "./beacon/sign.js";
export { verifyBeacon } from "./beacon/verify.js";
export {
  validateBeaconStructure,
  validateUnsignedBeaconStructure
} from "./beacon/validate.js";

export type { MOTB8BeaconV01 } from "./beacon/types.js";
export type {
  UnsignedBeacon
} from "./beacon/sign.js";
export type {
  BeaconVerificationResult
} from "./beacon/verify.js";

export { encryptControlFile } from "./control/encrypt.js";
export { decryptControlFile } from "./control/decrypt.js";
export { unlockControlFile } from "./control/unlock.js";
export { validateControlFileStructure } from "./control/validate.js";

export type {
  EncryptedControlFile
} from "./control/encrypt.js";
export type {
  ControlFileMetadata
} from "./control/aad.js";

/**
 * Phase 23.6 — Discovery and revision-aware Beacons
 */

export { generateDiscoverySummary } from "./beacon/summary.js";
export { computeBeaconHash } from "./beacon/hash.js";
export { verifyBeaconRevision } from "./beacon/revision.js";
export { verifyBeaconChain } from "./beacon/chain.js";

export type { MOTB8BeaconV11 } from "./beacon/types-v1.1.js";
export type { SignedBeacon } from "./beacon/sign.js";
export type { DiscoverySummaryInput } from "./beacon/summary.js";

export type {
  BeaconRevisionVerificationResult
} from "./beacon/revision.js";

export type {
  BeaconChainStatus,
  BeaconChainVerificationResult
} from "./beacon/chain.js";

/**
 * Phase 23.6 — Machine-presence lifecycle
 */

export { createPresence } from "./presence/create.js";
export { updatePresenceBeacon } from "./presence/update.js";
export { migratePresenceBeacon } from "./presence/migrate.js";

export type {
  PresenceRegistration,
  CreatePresenceInput,
  CreatedPresence
} from "./presence/types.js";

export type {
  BeaconUpdateChanges,
  UpdatePresenceBeaconInput,
  UpdatedPresenceBeacon
} from "./presence/update-types.js";

export type {
  MigratePresenceBeaconInput,
  MigratedPresenceBeacon
} from "./presence/migration-types.js";
