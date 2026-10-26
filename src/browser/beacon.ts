import canonicalize from "canonicalize";

import type { MOTB8BeaconV01 } from "../beacon/types.js";
import type { MOTB8BeaconV11 } from "../beacon/types-v1.1.js";
import type { BrowserControllerKeyPair } from "./controller.js";

import { isValidBrowserMotb8Tag } from "./tag.js";
import { validateUnsignedBrowserBeaconStructure } from "./validate.js";

type UnsignedV10 = Omit<MOTB8BeaconV01, "proof">;
type UnsignedV11 = Omit<MOTB8BeaconV11, "proof">;

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export async function signBrowserBeacon(
  beacon: UnsignedV10,
  controller: BrowserControllerKeyPair
): Promise<MOTB8BeaconV01>;

export async function signBrowserBeacon(
  beacon: UnsignedV11,
  controller: BrowserControllerKeyPair
): Promise<MOTB8BeaconV11>;

export async function signBrowserBeacon(
  beacon: UnsignedV10 | UnsignedV11,
  controller: BrowserControllerKeyPair
): Promise<MOTB8BeaconV01 | MOTB8BeaconV11> {
  if (!validateUnsignedBrowserBeaconStructure(beacon)) {
    throw new Error("Invalid unsigned Beacon structure");
  }

  if (!(await isValidBrowserMotb8Tag(beacon.motb8Tag))) {
    throw new Error("Invalid MOTB-8 Tag");
  }

  const privateJwk = await crypto.subtle.exportKey(
    "jwk",
    controller.privateKey
  );

  if (
    privateJwk.x !== controller.publicKeyJwk.x ||
    privateJwk.x !== beacon.controller.publicKeyJwk.x
  ) {
    throw new Error("Beacon controller key mismatch");
  }

  const canonical = canonicalize(beacon);

  if (typeof canonical !== "string") {
    throw new Error("Beacon canonicalization failed");
  }

  const signature = new Uint8Array(
    await crypto.subtle.sign(
      "Ed25519",
      controller.privateKey,
      new TextEncoder().encode(canonical)
    )
  );

  const proof = {
    type: "Ed25519Signature2026" as const,
    verificationMethod: "#controller-1" as const,
    canonicalization: "RFC8785-JCS" as const,
    signature: encodeBase64Url(signature)
  };

  if (beacon.schemaVersion === "1.1") {
    return { ...beacon, proof };
  }

  return { ...beacon, proof };
}
