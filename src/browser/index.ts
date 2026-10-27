/**
 * MOTB-8 Browser Entry Point
 *
 * Browser-compatible access to MOTB-8 core functionality.
 *
 * Cryptographic operations must execute locally in the
 * operator's browser. No private keys or passphrases
 * are transmitted to a server.
 *
 * The existing Node.js entry point remains unchanged.
 */

export { encodeCrockfordBase32 } from "../tag/base32.js";
export { generateDiscoverySummary } from "../beacon/summary.js";
export {
  generateBrowserMotb8Tag,
  computeBrowserTagChecksum,
  isValidBrowserMotb8Tag
} from "./tag.js";
export {
  generateBrowserControllerKeyPair
} from "./controller.js";

export type {
  BrowserControllerKeyPair
} from "./controller.js";
export { createBrowserGenesisRecord } from "./genesis.js";
export { signBrowserBeacon } from "./beacon.js";

export {
  validateBrowserBeaconStructure,
  validateUnsignedBrowserBeaconStructure
} from "./validate.js";
export {
  encryptBrowserControlFile,
  decryptBrowserControlFile
} from "./control.js";
export {
  verifyBrowserGenesisRecord
} from "./verify-genesis.js";
export {
  unlockBrowserControlFile
} from "./unlock.js";

export { verifyBrowserBeacon } from "./verify-beacon.js";
