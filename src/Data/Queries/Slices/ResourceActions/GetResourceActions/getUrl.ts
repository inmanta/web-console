import { PageSize } from "@/Core/Domain";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { changeTypes, ResourceActionFilter } from "@S/ResourceActions/Core/Domain";

export interface GetResourceActionsUrlParams {
  filter?: ResourceActionFilter;
  pageSize: PageSize.PageSize;
  currentPage: CurrentPage;
}

/**
 * Constructs the URL for the `get_resource_actions` API, applying the
 * server-side filters and the cursor stored in the current page.
 *
 * The API only supports one timestamp cursor at a time (`first_timestamp` OR
 * `last_timestamp`), which is why pagination is driven by the raw cursor
 * fragment carried in `currentPage.value` rather than a numeric offset.
 *
 * @param {GetResourceActionsUrlParams} params - The query parameters.
 * @returns {string} The constructed URL.
 */
export function getUrl({ filter, pageSize, currentPage }: GetResourceActionsUrlParams): string {
  const filterParams: string[] = [];

  if (filter?.resource_type) {
    filterParams.push(`resource_type=${encodeURIComponent(filter.resource_type)}`);
  }
  if (filter?.agent) {
    filterParams.push(`agent=${encodeURIComponent(filter.agent)}`);
  }
  if (filter?.value) {
    filterParams.push(`attribute_value=${encodeURIComponent(filter.value)}`);
  }
  // The API filters outcomes via `exclude_changes`, so translate the selected
  // outcomes into the set of change values to exclude.
  if (filter?.outcome && filter.outcome.length > 0) {
    changeTypes
      .filter((change) => !filter.outcome?.includes(change))
      .forEach((change) => filterParams.push(`exclude_changes=${encodeURIComponent(change)}`));
  }

  const filterParam = filterParams.length > 0 ? `&${filterParams.join("&")}` : "";
  const cursorParam = currentPage.value ? `&${currentPage.value}` : "";

  return `/api/v2/resource_actions?limit=${pageSize.value}${filterParam}${cursorParam}`;
}
