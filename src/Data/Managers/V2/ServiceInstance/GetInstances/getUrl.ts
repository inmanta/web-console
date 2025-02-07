import { capitalize } from "@patternfly/react-core";
import qs from "qs";
import { Sort } from "@/Core";
import {
  ServiceInstanceParams,
  Filter,
} from "@/Core/Domain/ServiceInstanceParams";

export interface UrlParams extends ServiceInstanceParams {
  name: string;
}

/**
 * Constructs a URL for fetching service instances with the given parameters.
 *
 * @param {UrlParams} params - The parameters for constructing the URL.
 * @param {string} params.name - The name of the service instance.
 * @param {Filter} [params.filter] - The filter criteria for the service instances.
 * @param {Sort} [params.sort] - The sorting criteria for the service instances.
 * @param {PageSize} params.pageSize - The number of instances per page.
 * @param {CurrentPage} params.currentPage - The current page number.
 * @param {boolean} [includeDeploymentProgress=true] - Whether to include deployment progress in the response.
 * @returns {string} The constructed URL.
 */
export function getUrl(
  { name, filter, sort, pageSize, currentPage }: UrlParams,
  includeDeploymentProgress = true,
): string {
  const filterParam = filter
    ? `&${qs.stringify(
        { filter: filterToRaw(filter) },
        { allowDots: true, arrayFormat: "repeat" },
      )}`
    : "";
  const sortParam = sort ? `&sort=${Sort.serialize(sort)}` : "";
  const includeDeletedParam =
    filter?.deleted === "Include" ? "&include_deleted=true" : "";

  return `/lsm/v1/service_inventory/${name}?include_deployment_progress=${capitalize(
    includeDeploymentProgress.toString(),
  )}&limit=${pageSize.value}${filterParam}${sortParam}${includeDeletedParam}${
    currentPage.value ? `&${currentPage.value}` : ""
  }`;
}

const filterToRaw = (filter: Filter) => {
  if (typeof filter === "undefined") return {};
  const {
    state,
    deleted,
    attributeSetEmpty: attribute_set_empty,
    attributeSetNotEmpty: attribute_set_not_empty,
    id_or_service_identity,
  } = filter;

  return {
    state,
    deleted: deleted === "Only" ? true : undefined,
    attribute_set_empty,
    attribute_set_not_empty,
    id_or_service_identity,
  };
};
