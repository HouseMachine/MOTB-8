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
