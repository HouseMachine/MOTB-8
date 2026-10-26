import { copyFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const source = "src/browser/generated/beacon-validators.cjs";
const destination = "dist/browser/generated/beacon-validators.cjs";

mkdirSync(dirname(destination), { recursive: true });
copyFileSync(source, destination);

console.log("Browser validators copied to distribution.");
