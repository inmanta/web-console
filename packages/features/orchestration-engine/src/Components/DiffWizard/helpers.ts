import { Diff, Resource } from "@inmanta/web-console-core";
import {
  DIFF_FILTER_ID_KEYS,
  DiffFilter,
  Item,
  RESOURCE_LIST_STATUS_ORDER,
  ResourceIdParts,
  ResourceListGroup,
} from "./types";

/**
 * Gets the parts of a resource id that the resource id filters match: its type, agent and id
 * value. An id that doesn't parse has no type or agent, and its whole id is its value.
 */
const getResourceIdParts = (resourceId: string): ResourceIdParts => {
  const id = Resource.IdParser.parse(resourceId);

  return {
    type: id?.entityType ?? null,
    agent: id?.agentName ?? null,
    value: id?.attributeValue ?? resourceId,
  };
};

/**
 * Gets the attribute value of a resource id, like the path of a file, to name the resource in
 * short. Returns the whole id when it can't be parsed.
 */
export const getAttributeValueOrId = (resourceId: string): string =>
  getResourceIdParts(resourceId).value;

/**
 * Groups the resources of a diff by status, in the order of the resource list, each group sorted
 * by resource id. Statuses without resources get no group.
 */
export const getResourceListGroups = (items: Item[]): ResourceListGroup[] => {
  const groups: ResourceListGroup[] = [];
  let startIndex = 0;

  RESOURCE_LIST_STATUS_ORDER.forEach((status) => {
    const groupItems = items
      .filter((item) => item.status === status)
      .sort((a, b) => a.id.localeCompare(b.id));

    if (groupItems.length > 0) {
      groups.push({ status, startIndex, items: groupItems });
      startIndex += groupItems.length;
    }
  });

  return groups;
};

/**
 * Gets the resources of the resource list in the order they show, group after group.
 */
export const getResourceListItems = (groups: ResourceListGroup[]): Item[] =>
  groups.flatMap((group) => group.items);

/**
 * Gets the diff filter with the default statuses filled in, as long as the statuses were never
 * changed. Once they were, an unset status means none are ticked.
 */
export const getDiffFilterWithDefaults = (filter: DiffFilter): DiffFilter =>
  !filter.disregardDefault && !filter.status ? { ...filter, status: Diff.defaultStatuses } : filter;

/**
 * Gets the resources of a diff that the filter shows: a ticked status, and for each resource id
 * filter with values, an id part that contains one of them, ignoring case.
 */
export const getFilteredDiffResources = (
  resources: Diff.Resource[],
  filter: DiffFilter
): Diff.Resource[] => {
  const statuses = filter.status ?? [];
  const idFilters = DIFF_FILTER_ID_KEYS.map((key) => ({
    key,
    values: (filter[key] ?? []).map((value) => value.toLocaleLowerCase()),
  })).filter(({ values }) => values.length > 0);

  return resources.filter((resource) => {
    if (!statuses.includes(resource.status)) {
      return false;
    }

    if (idFilters.length === 0) {
      return true;
    }

    const idParts = getResourceIdParts(resource.resource_id);

    return idFilters.every(({ key, values }) => {
      const idPart = idParts[key]?.toLocaleLowerCase();

      return idPart !== undefined && values.some((value) => idPart.includes(value));
    });
  });
};

/**
 * Counts the resources of a diff per status, in one pass. Statuses without resources are left
 * out.
 */
export const getDiffStatusCounts = (resources: Diff.Resource[]): Map<Diff.Status, number> => {
  const counts = new Map<Diff.Status, number>();

  resources.forEach((resource) => {
    counts.set(resource.status, (counts.get(resource.status) ?? 0) + 1);
  });

  return counts;
};

/**
 * Counts the resources whose status isn't selected, from the number of resources per status.
 */
export const getHiddenByStatusCount = (
  statusCounts: Map<Diff.Status, number>,
  selectedStatuses: Diff.Status[]
): number => {
  let hiddenCount = 0;

  statusCounts.forEach((count, status) => {
    if (!selectedStatuses.includes(status)) {
      hiddenCount += count;
    }
  });

  return hiddenCount;
};
