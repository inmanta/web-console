import { Resource } from "@inmanta/web-console-core";
import { Item, RESOURCE_LIST_STATUS_ORDER, ResourceListGroup } from "./types";

/**
 * Gets the attribute value of a resource id, like the path of a file, to name the resource in
 * short. Returns the whole id when it can't be parsed.
 */
export const getAttributeValueOrId = (resourceId: string): string =>
  Resource.IdParser.parse(resourceId)?.attributeValue ?? resourceId;

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
