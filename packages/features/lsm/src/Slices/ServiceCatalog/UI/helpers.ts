import {
  compareEntityAnnotations,
  resolveEntityAnnotations,
  ServiceModel,
  words,
} from "@inmanta/web-console-core";
import { CatalogSection, CatalogService } from "./types";

/**
 * Splits the services into catalog sections by `web_group`, which only applies to root
 * services. Group sections are ordered by the lowest `web_order` of their services, then by
 * name, and the ungrouped services come last. Services within a section are ordered by
 * `web_order`, then by title.
 *
 * @example
 * createCatalogSections([vpn (web_group "Network"), router (no group)])
 * // [{ kind: "Group", name: "Network", services: [vpn] }, { kind: "Ungrouped", services: [router] }]
 */
export const createCatalogSections = (serviceModels: ServiceModel[]): CatalogSection[] => {
  const servicesByGroup = new Map<string, CatalogService[]>();
  const ungroupedServices: CatalogService[] = [];

  for (const serviceModel of serviceModels) {
    const service: CatalogService = {
      serviceModel,
      resolvedAnnotations: resolveEntityAnnotations(serviceModel),
    };
    const group = serviceModel.owner === null ? service.resolvedAnnotations.web_group : undefined;

    if (group === undefined) {
      ungroupedServices.push(service);
      continue;
    }

    const groupServices = servicesByGroup.get(group) ?? [];

    groupServices.push(service);
    servicesByGroup.set(group, groupServices);
  }

  const groupEntries = [...servicesByGroup.entries()];

  for (const [, services] of groupEntries) {
    services.sort(compareCatalogServices);
  }

  const sections: CatalogSection[] = groupEntries
    .sort(compareGroups)
    .map(([name, services]): CatalogSection => ({ kind: "Group", name, services }));

  if (ungroupedServices.length > 0) {
    sections.push({ kind: "Ungrouped", services: ungroupedServices.sort(compareCatalogServices) });
  }

  return sections;
};

/**
 * Formats the title of a catalog section: the group name, or "Other services".
 */
export const formatSectionTitle = (section: CatalogSection): string =>
  section.kind === "Group" ? section.name : words("catalog.section.ungrouped");

/**
 * Formats a service description as a single line, so a multi-line docstring fits one row.
 */
export const formatDescriptionLine = (description: string): string =>
  description.replace(/\s+/g, " ");

/**
 * Gets the total number of instances of the services in a section.
 */
export const getSectionInstanceCount = (section: CatalogSection): number =>
  section.services.reduce(
    (count, { serviceModel }) => count + Number(serviceModel.instance_summary?.total ?? 0),
    0
  );

/**
 * Comparator that orders catalog services by `web_order`, then by title.
 */
const compareCatalogServices = (a: CatalogService, b: CatalogService): number =>
  compareEntityAnnotations(a.resolvedAnnotations, b.resolvedAnnotations);

/**
 * Comparator for `[group name, services]` entries whose services are already sorted. It orders
 * groups by the `web_order` of their first service, which is the lowest one, groups without
 * any order last, and falls back to the name.
 */
const compareGroups = (
  [nameA, servicesA]: [string, CatalogService[]],
  [nameB, servicesB]: [string, CatalogService[]]
): number => {
  const orderA = servicesA[0].resolvedAnnotations.web_order ?? Number.MAX_SAFE_INTEGER;
  const orderB = servicesB[0].resolvedAnnotations.web_order ?? Number.MAX_SAFE_INTEGER;

  return orderA - orderB || nameA.localeCompare(nameB);
};
