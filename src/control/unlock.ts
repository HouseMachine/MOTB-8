import { createPublicKey } from "node:crypto";
import type { KeyObject } from "node:crypto";

import { decryptControlFile } from "./decrypt.js";
import { verifyGenesisRecord } from "../genesis/verify.js";
import type { GenesisRecord } from "../genesis/create.js";
import type { EncryptedControlFile } from "./encrypt.js";

export function unlockControlFile(
  file: EncryptedControlFile,
  passphrase: string,
  genesis: GenesisRecord
): KeyObject {
  const genesisResult = verifyGenesisRecord(genesis);

  if (genesisResult.status !== "VALID_UNANCHORED") {
    throw new Error("Genesis verification failed or unsupported");
  }

  if (file.motb8Tag !== genesis.motb8Tag) {
    throw new Error("Control File and Genesis Tag mismatch");
  }

  const privateKey = decryptControlFile(file, passphrase);

  const derivedPublicKey = createPublicKey(privateKey);
  const derivedJwk = derivedPublicKey.export({ format: "jwk" });

  if (derivedJwk.x !== genesis.controller.publicKeyJwk.x) {
    throw new Error("Recovered controller does not match Genesis");
  }

  return privateKey;
}
