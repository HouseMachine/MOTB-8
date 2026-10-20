import { sign, type KeyObject } from "node:crypto";
import canonicalize from "canonicalize";
import { parseMotb8Tag } from "../tag/parse.js";
import type { MOTB8BeaconV01 } from "./types.js";
import type { MOTB8BeaconV11 } from "./types-v1.1.js";
import { validateUnsignedBeaconStructure } from "./validate.js";

export type SignedBeacon = MOTB8BeaconV01 | MOTB8BeaconV11;

export type UnsignedBeacon =
  | Omit<MOTB8BeaconV01, "proof">
  | Omit<MOTB8BeaconV11, "proof">;

export function signBeacon(
  beacon: Omit<MOTB8BeaconV01, "proof">,
  privateKey: KeyObject
): MOTB8BeaconV01;

export function signBeacon(
  beacon: Omit<MOTB8BeaconV11, "proof">,
  privateKey: KeyObject
): MOTB8BeaconV11;

export function signBeacon(
  beacon: UnsignedBeacon,
  privateKey: KeyObject
): SignedBeacon {
  if (!validateUnsignedBeaconStructure(beacon)) {
    throw new Error("Invalid unsigned Beacon structure");
  }
  parseMotb8Tag(beacon.motb8Tag);

  if (privateKey.asymmetricKeyType !== "ed25519") {
    throw new Error("Beacon signing requires an Ed25519 private key");
  }

  const derivedJwk = privateKey.export({ format: "jwk" });

  if (derivedJwk.x !== beacon.controller.publicKeyJwk.x) {
    throw new Error("Beacon controller key mismatch");
  }

  const canonical = canonicalize(beacon);

  if (typeof canonical !== "string") {
    throw new Error("Beacon canonicalization failed");
  }

  const signature = sign(
    null,
    Buffer.from(canonical, "utf8"),
    privateKey
  ).toString("base64url");

  return {
    ...beacon,
    proof: {
      type: "Ed25519Signature2026",
      verificationMethod: "#controller-1",
      canonicalization: "RFC8785-JCS",
      signature
    }
  };
}

