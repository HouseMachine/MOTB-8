import { signBeacon } from "../beacon/sign.js";
import { verifyBeacon } from "../beacon/verify.js";
import { validateUnsignedBeaconStructure } from "../beacon/validate.js";
import { unlockControlFile } from "./unlock.js";

import type { GenesisRecord } from "../genesis/create.js";
import type { EncryptedControlFile } from "./encrypt.js";
import type { MOTB8BeaconV11 } from "../beacon/types-v1.1.js";

export interface SignAuthorizedBeaconInput {
  unsignedBeacon: Omit<MOTB8BeaconV11, "proof">;
  genesis: GenesisRecord;
  controlFile: EncryptedControlFile;
  passphrase: string;
}

export function signAuthorizedBeacon(
  input: SignAuthorizedBeaconInput
): MOTB8BeaconV11 {
  if (!validateUnsignedBeaconStructure(input.unsignedBeacon)) {
    throw new Error("Invalid unsigned Beacon structure");
  }

  if (input.unsignedBeacon.schemaVersion !== "1.1") {
    throw new Error("Authorized signing requires Beacon v1.1");
  }

  if (input.unsignedBeacon.motb8Tag !== input.genesis.motb8Tag) {
    throw new Error("Beacon and Genesis Tag mismatch");
  }

  const privateKey = unlockControlFile(
    input.controlFile,
    input.passphrase,
    input.genesis
  );

  const beacon = signBeacon(input.unsignedBeacon, privateKey);

  const result = verifyBeacon(beacon, input.genesis);

  if (!result.valid) {
    throw new Error(`Authorized Beacon verification failed: ${result.reason}`);
  }

  return beacon;
}
