import {
  compareEntityAnnotations,
  resolveEntityAnnotations,
  ServiceModel,
  words,
} from "@inmanta/web-console-core";
import {
  getStateCounts,
  StateCount,
  summaryLabels,
  summaryLabelSeverity,
} from "@inmanta/web-console-feature-lsm/Components/InstanceSummaryLabels";
import {
  CatalogSection,
  CatalogService,
  FilteredCatalogSections,
  LabelCount,
  OwnedServiceStateCount,
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
 * // [{ kind: "Group", name: "Network", services: [vpn (ownedServices: [vpn_tunnel])] }, { kind: "Ungrouped", services: [router] }]
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
 * Gets the instance counts of the services a service owns, at any depth, in the states that are
 * not labeled "success". The counts are ordered by label, most severe first, then in catalog
 * order of the owned services.
 *
 * @example
 * getOwnedServicesStateCounts(deployment (owns dns_record: 2 up, 1 creating; virtual_ip: 1 failed))
 * // [{ ownedServiceTitle: "Virtual IP", stateName: "failed", label: "danger", count: 1, ... },
 * //  { ownedServiceTitle: "DNS record", stateName: "creating", label: "info", count: 1, ... }]
 */
export const getOwnedServicesStateCounts = (service: CatalogService): OwnedServiceStateCount[] => {
  const ownedServicesStateCounts: OwnedServiceStateCount[] = [];

  const addStateCounts = ({ serviceModel, resolvedAnnotations, ownedServices }: CatalogService) => {
    if (serviceModel.instance_summary) {
      for (const stateCount of getStateCounts(
        serviceModel.instance_summary,
        serviceModel.lifecycle.states
      )) {
        if (stateCount.label !== "success") {
          ownedServicesStateCounts.push({
            ...stateCount,
            ownedServiceName: serviceModel.name,
            ownedServiceTitle: resolvedAnnotations.web_title,
          });
        }
      }
    }

    ownedServices.forEach(addStateCounts);
  };

  service.ownedServices.forEach(addStateCounts);

  return ownedServicesStateCounts.sort(
    (a, b) => summaryLabelSeverity[a.label] - summaryLabelSeverity[b.label]
  );
};

/**
 * Gets the total instance count per label over the given state counts, most severe first,
 * leaving out labels without any.
 *
 * @example
 * getLabelCounts([{ label: "danger", count: 1, ... }, { label: "info", count: 2, ... }, { label: "danger", count: 3, ... }])
 * // [{ label: "danger", count: 4 }, { label: "info", count: 2 }]
 */
export const getLabelCounts = (stateCounts: StateCount[]): LabelCount[] => {
  const labelCounts: LabelCount[] = [];

  for (const label of summaryLabels) {
    const count = stateCounts
      .filter((stateCount) => stateCount.label === label)
      .reduce((total, stateCount) => total + stateCount.count, 0);

    if (count > 0) {
      labelCounts.push({ label, count });
    }
  }

  return labelCounts;
};

/**
 * Filters the sections down to the services that match the filter text and the owners on the
 * path to them, and collects those owners so they can start expanded. A matching service keeps
 * all its owned services; sections left without services are dropped. A blank filter text
 * returns the sections unchanged and no owners.
 *
 * @example
 * filterCatalogSections([{ kind: "Ungrouped", services: [deployment (owns dns_record, virtual_ip)] }], "dns")
 * // { sections: [{ kind: "Ungrouped", services: [deployment (ownedServices: [dns_record])] }],
 * //   ownerNamesOfMatchingServices: Set { "deployment" } }
 */
export const filterCatalogSections = (
  sections: CatalogSection[],
  filterText: string
): FilteredCatalogSections => {
  const normalizedFilterText = normalizeFilterText(filterText);
  const ownerNamesOfMatchingServices = new Set<string>();

  if (normalizedFilterText === "") {
    return { sections, ownerNamesOfMatchingServices };
  }

  const filterServices = (services: CatalogService[]): CatalogService[] => {
    const filteredServices: CatalogService[] = [];

    for (const service of services) {
      const filteredOwnedServices = filterServices(service.ownedServices);

      if (filteredOwnedServices.length > 0) {
        ownerNamesOfMatchingServices.add(service.serviceModel.name);
      }

      if (isCatalogServiceMatch(service, normalizedFilterText)) {
        filteredServices.push(service);
      } else if (filteredOwnedServices.length > 0) {
        filteredServices.push({ ...service, ownedServices: filteredOwnedServices });
      }
    }

    return filteredServices;
  };

  const filteredSections: CatalogSection[] = [];

  for (const section of sections) {
    const services = filterServices(section.services);

    if (services.length > 0) {
      filteredSections.push({ ...section, services });
    }
  }

  return { sections: filteredSections, ownerNamesOfMatchingServices };
};

/**
 * Gets the names of the services that own other services, at any depth.
 */
export const getOwnerServiceNames = (sections: CatalogSection[]): Set<string> => {
  const ownerServiceNames = new Set<string>();

  for (const service of getAllCatalogServices(sections)) {
    if (service.ownedServices.length > 0) {
      ownerServiceNames.add(service.serviceModel.name);
    }
  }

  return ownerServiceNames;
};

/**
 * Gets the filter text as it is matched: trimmed and lowercase.
 */
const normalizeFilterText = (filterText: string): string => filterText.trim().toLowerCase();

/**
 * Whether the `web_title` or the name of a service contains the normalized filter text,
 * ignoring case.
 */
const isCatalogServiceMatch = (
  { serviceModel, resolvedAnnotations }: CatalogService,
  normalizedFilterText: string
): boolean =>
  resolvedAnnotations.web_title.toLowerCase().includes(normalizedFilterText) ||
  serviceModel.name.toLowerCase().includes(normalizedFilterText);

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
