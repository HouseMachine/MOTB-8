export const PUBLIC_ARTIFACTS = {
  genesis: "genesis.json",
  beacon: "beacon.json"
} as const;

export const PRIVATE_ARTIFACTS = {
  controlFile: "control-file.json"
} as const;

export const REVISION_ARTIFACTS = {
  directory: "revisions",
  legacyBeacon: "beacon-v1.0.json",
  migratedBeacon: "beacon-v1.1-r1.json"
} as const;
