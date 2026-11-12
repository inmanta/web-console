import { ResolvedEntityAnnotations, ServiceModel } from "@inmanta/web-console-core";
import {
  StateCount,
  SummaryLabel,
} from "@inmanta/web-console-feature-lsm/Components/InstanceSummaryLabels";

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

/**
 * The number of instances of an owned service in one lifecycle state, shown in the tooltip of
 * the "not success" label of a collapsed owner.
 */
export interface OwnedServiceStateCount extends StateCount {
  /** The service entity name of the owned service. */
  ownedServiceName: string;

  /** The `web_title` of the owned service. */
  ownedServiceTitle: string;
}

/**
 * The number of instances with one lifecycle label, summed over several states or services.
 */
export interface LabelCount {
  label: SummaryLabel;
  count: number;
}
