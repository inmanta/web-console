import { PageSize, Resource } from "@/Core/Domain";
import { MultiSort } from "@/Data";
import { graphql } from "@/Data/Apollo/gql";
import type { GetResourcesQueryVariables } from "@/Data/Apollo/gql/graphql";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { mapSort, mapToResourceActionFilter, parseCurrentPage } from "@/Data/Queries";

/**
 * The query behind the resources page. The page of resources and the environment summary are each deferred,
 * so the server sends each one as soon as it resolves and the page fills in part by part.
 * Each row selects its own fields through its fragment.
 */
export const GET_RESOURCES = graphql(`
  query GetResources(
    $filter: ResourceFilter!
    $environment: String!
    $first: Int
    $after: String
    $last: Int
    $before: String
    $orderBy: [StrawberryOrder!]
  ) {
    ... @defer(label: "resources") {
      resources(
        filter: $filter
        first: $first
        after: $after
        last: $last
        before: $before
        orderBy: $orderBy
      ) {
        totalCount
        pageInfo {
          ...PageInfo_Fragment @unmask
        }
        edges {
          node {
            resourceId
            ...ResourceTableRow_Fragment
          }
        }
      }
    }

    resourceSummary(environment: $environment) {
      totalCount
      isDeploying
      blocked
      compliance
      lastHandlerRun
    }
  }
`);

interface Params {
  env: string;
  pageSize: PageSize.PageSize;
  filter: Resource.Filter;
  sort: MultiSort<Resource.SortKey>;
  currentPage: CurrentPage;
}

/**
 * Builds the variables of the resources query from the URL state of the page.
 *
 * @example
 * toResourcesVariables({ env: "env-id", pageSize: { value: "20" }, filter: {}, sort: [], currentPage: { value: "" } })
 * // { filter: { environment: "env-id" }, environment: "env-id", first: 20 }
 */
export const toResourcesVariables = ({
  env,
  pageSize,
  filter,
  sort,
  currentPage,
}: Params): GetResourcesQueryVariables => {
  const { after, before } = parseCurrentPage(currentPage);
  const pageSizeNum = Number(pageSize.value);
  const paginationVariables = before
    ? { last: pageSizeNum, before }
    : { first: pageSizeNum, ...(after ? { after } : {}) };

  return {
    //TODO: https://github.com/inmanta/web-console/issues/6823 => same as in ResourceFilterForm.tsx
    filter: { environment: env, ...mapToResourceActionFilter(filter) },
    environment: env,
    ...paginationVariables,
    ...(sort.length > 0 ? { orderBy: mapSort(sort) } : {}),
  };
};
