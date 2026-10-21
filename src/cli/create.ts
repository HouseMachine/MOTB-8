import { readRegistrationJson } from "./registration-json.js";
import { createPresence } from "../presence/create.js";
import { readSecret } from "./secret.js";
import { writePresenceArtifacts } from "./artifacts/write-presence.js";

import type { PresenceRegistration } from "../presence/types.js";

export async function createPresenceFromCli(
  registrationPath: string,
  outputDirectory: string
): Promise<void> {
  const registration =
    readRegistrationJson(registrationPath) as PresenceRegistration;

  const passphrase = await readSecret(
    "Enter Control File passphrase: "
  );

  const presence = createPresence({
    registration,
    passphrase
  });

  const paths = writePresenceArtifacts(
    outputDirectory,
    presence
  );

  console.log("MOTB-8 machine presence created");
  console.log(`Tag: ${presence.tag}`);
  console.log(`Public artifacts: ${paths.publicDir}`);
  console.log(`Private Control File: ${paths.controlFile}`);
  console.log("Keep your encrypted Control File private and backed up.");
}
