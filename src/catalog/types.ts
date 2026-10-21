import type { MOTB8BeaconV11 } from "../beacon/types-v1.1.js";

export type BeaconCatalogs =
  NonNullable<MOTB8BeaconV11["catalogs"]>;

export type NativeCatalogEntry =
  NonNullable<BeaconCatalogs["native"]>[number];

export type ExternalCatalogEntry =
  NonNullable<BeaconCatalogs["external"]>[number];

export type CatalogDirection = "OFFER" | "SEEK";
