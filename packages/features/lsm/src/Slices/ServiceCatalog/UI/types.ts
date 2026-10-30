import { ResolvedEntityAnnotations, ServiceModel } from "@inmanta/web-console-core";

/**
 * A service in the catalog together with its resolved entity annotations.
 */
export interface CatalogService {
  serviceModel: ServiceModel;
  resolvedAnnotations: ResolvedEntityAnnotations;
}

/**
 * A section of the service catalog. A "Group" section holds the services that share a
 * `web_group`; the "Ungrouped" section holds the services without one.
 */
export type CatalogSection =
  | {
      kind: "Group";

      /** The shared `web_group` value. */
      name: string;
      services: CatalogService[];
    }
  | { kind: "Ungrouped"; services: CatalogService[] };

/**
 * The number of cells in a ServiceRow: service, instances, inventory link and actions.
 * A section heading spans all of them.
 */
export const serviceRowColumnCount = 4;
