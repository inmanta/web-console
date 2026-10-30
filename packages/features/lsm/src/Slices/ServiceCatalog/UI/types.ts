import { ResolvedEntityAnnotations, ServiceModel } from "@inmanta/web-console-core";

/**
 * A service in the catalog together with its resolved entity annotations and the services
 * it owns.
 */
export interface CatalogService {
  serviceModel: ServiceModel;
  resolvedAnnotations: ResolvedEntityAnnotations;

  /** The services whose `owner` is this service, ordered by `web_order`, then by title. */
  ownedServices: CatalogService[];
}

/**
 * A section of the service catalog. A "Group" section holds the root services that share a
 * `web_group`; the "Ungrouped" section holds the root services without one. Owned services
 * sit under their owner, not directly in a section.
 */
export type CatalogSection =
  | {
      kind: "Group";

      /** The shared `web_group` value. */
      name: string;
      services: CatalogService[];
    }
  | { kind: "Ungrouped"; services: CatalogService[] };

/** The icon of a service that owns other services and has no `web_icon`. */
export const ownerServiceFallbackIconName = "FaFolder";

/** The icon of a service that owns no other services and has no `web_icon`. */
export const serviceFallbackIconName = "FaCube";

/**
 * The number of cells in a ServiceRow: service, instances, inventory link and actions.
 * A section heading spans all of them.
 */
export const serviceRowColumnCount = 4;
