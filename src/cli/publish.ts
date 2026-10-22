import { preparePublishingPackage } from "./publishing/package.js";

export function publishPresenceFromCli(
  directory: string,
  outputDirectory: string
): void {
  const result = preparePublishingPackage(
    directory,
    outputDirectory
  );

  console.log("MOTB-8 publishing package prepared");
  console.log(`Output: ${result.outputDirectory}`);
  console.log(`Public artifacts: ${result.manifest.files.length}`);
  console.log("SHA-256 manifest generated.");
  console.log("Encrypted Control File excluded.");
  console.log("No files uploaded or published automatically.");
}
