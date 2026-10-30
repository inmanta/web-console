import {
  compareEntityAnnotations,
  resolveEntityAnnotations,
  ServiceModel,
  words,
} from "@inmanta/web-console-core";
import {
  CatalogSection,
  CatalogService,
  ownerServiceFallbackIconName,
  serviceFallbackIconName,
} from "./types";

/**
 * Nests the owned services under their owner and splits the root services into catalog
 * sections by `web_group`, which only applies to roots. A service whose owner is not in the
 * catalog counts as a root, so it is never lost. Group sections are ordered by the lowest
 * `web_order` of their services, then by name, and the ungrouped services come last. Services
 * within a section and owned services under an owner are ordered by `web_order`, then by title.
 *
 * @example
 * createCatalogSections([vpn (web_group "Network"), vpn_tunnel (owner vpn), router (no group)])
 * // [{ kind: "Group", name: "Network", services: [vpn, owning vpn_tunnel] }, { kind: "Ungrouped", services: [router] }]
 */
export const createCatalogSections = (serviceModels: ServiceModel[]): CatalogSection[] => {
  const servicesByName = new Map<string, CatalogService>();

  for (const serviceModel of serviceModels) {
    servicesByName.set(serviceModel.name, {
      serviceModel,
      resolvedAnnotations: resolveEntityAnnotations(serviceModel),
      ownedServices: [],
    });
  }

  const rootServices: CatalogService[] = [];

  for (const service of servicesByName.values()) {
    const owner =
      service.serviceModel.owner === null
        ? undefined
        : servicesByName.get(service.serviceModel.owner);

    if (owner === undefined) {
      rootServices.push(service);
    } else {
      owner.ownedServices.push(service);
    }
  }

  for (const service of servicesByName.values()) {
    sortCatalogServices(service.ownedServices);
  }

  const servicesByGroup = new Map<string, CatalogService[]>();
  const ungroupedServices: CatalogService[] = [];

  for (const service of rootServices) {
    const group = service.resolvedAnnotations.web_group;

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
    sortCatalogServices(services);
  }

  const sections: CatalogSection[] = sortGroups(groupEntries).map(
    ([name, services]): CatalogSection => ({ kind: "Group", name, services })
  );

  if (ungroupedServices.length > 0) {
    sections.push({ kind: "Ungrouped", services: sortCatalogServices(ungroupedServices) });
  }

  return sections;
};

/**
 * Gets the title of a catalog section: the group name, or "Other services".
 */
export const getSectionTitle = (section: CatalogSection): string =>
  section.kind === "Group" ? section.name : words("catalog.section.ungrouped");

/**
 * Gets every service in the sections, the owned services at any depth included, each owner
 * before the services it owns.
 */
export const getAllCatalogServices = (sections: CatalogSection[]): CatalogService[] => {
  const allServices: CatalogService[] = [];

  const addWithOwnedServices = (service: CatalogService): void => {
    allServices.push(service);
    service.ownedServices.forEach(addWithOwnedServices);
  };

  sections.forEach((section) => section.services.forEach(addWithOwnedServices));

  return allServices;
};

/**
 * Gets the icon name of a service: its `web_icon`, or a fallback that shows whether the service
 * owns other services.
 */
export const getServiceIconName = ({
  serviceModel,
  resolvedAnnotations,
}: CatalogService): string => {
  if (resolvedAnnotations.web_icon !== undefined) {
    return resolvedAnnotations.web_icon;
  }

  return serviceModel.owned_entities.length > 0
    ? ownerServiceFallbackIconName
    : serviceFallbackIconName;
};

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
 * Sorts catalog services in place by `web_order`, then by title, and returns them.
 */
const sortCatalogServices = (services: CatalogService[]): CatalogService[] =>
  services.sort((a, b) => compareEntityAnnotations(a.resolvedAnnotations, b.resolvedAnnotations));

/**
 * Sorts `[group name, services]` entries in place, whose services are already sorted. Groups
 * are ordered by the `web_order` of their first service, which is the lowest one, groups
 * without any order last, then by name.
 */
const sortGroups = (groupEntries: [string, CatalogService[]][]): [string, CatalogService[]][] =>
  groupEntries.sort(([nameA, servicesA], [nameB, servicesB]) => {
    const orderA = servicesA[0].resolvedAnnotations.web_order ?? Number.MAX_SAFE_INTEGER;
    const orderB = servicesB[0].resolvedAnnotations.web_order ?? Number.MAX_SAFE_INTEGER;

    return orderA - orderB || nameA.localeCompare(nameB);
  });
