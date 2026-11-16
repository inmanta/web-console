import { useContext } from "react";
import { UseQueryResult, keepPreviousData, useQuery } from "@tanstack/react-query";
import { PageSize, Pagination, Resource } from "@inmanta/web-console-core";
import { MultiSort } from "@inmanta/web-console-core/Common";
import { CurrentPage } from "@inmanta/web-console-core/Common/UrlState/useUrlStateWithCurrentPage";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { Handlers } from "@inmanta/web-console-core/Domain/Pagination/Pagination";
import { graphql } from "@inmanta/web-console-core/GraphQL/generated";
import type { GetResourcesQuery } from "@inmanta/web-console-core/GraphQL/generated/graphql";
import { useGraphQLRequest, REFETCH_INTERVAL } from "@inmanta/web-console-core/Queries/Helpers";
import { KeyFactory, SliceKeys } from "@inmanta/web-console-core/Queries/Helpers/KeyFactory";
import {
  buildHandlers,
  mapSort,
  mapToResourceActionFilterWithInstanceLabels,
  parseCurrentPage,
} from "./helpers";

/**
 * Flattened response from the useGetResources hook,
 * with pagination metadata and navigation handlers.
 */
export interface GetResourcesResponse {
  resources: Resource.Resource[];
  resourceSummary: Resource.ResourceSummary;
  metadata: Pagination.Metadata;
  handlers: Handlers;
}

/**
 * Return signature of the useGetResources React Query hook
 */
interface GetResources {
  useContinuous: () => UseQueryResult<GetResourcesResponse, Error>;
}

interface GetResourcesParams {
  pageSize: PageSize.PageSize;
  filter: Resource.Filter;
  sort: MultiSort<Resource.SortKey>;
  currentPage: CurrentPage;
}

const GET_RESOURCES_QUERY = graphql(`
  query GetResources(
    $filter: ResourceFilter!
    $environment: String!
    $first: Int
    $after: String
    $last: Int
    $before: String
    $orderBy: [StrawberryOrder!]
  ) {
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
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
      edges {
        node {
          resourceId
          resourceType
          agent
          resourceIdValue
          requiresLength
          state {
            isDeploying
            lastHandlerRun
            compliance
            blocked
            lastHandlerRunAt
            isOrphan
          }
        }
      }
    }
    resourceSummary(environment: $environment) {
      lastHandlerRun
      blocked
      compliance
      isDeploying
      totalCount
    }
  }
`);

/**
 * The page cursors of the resources query.
 */
export type PageInfo = GetResourcesQuery["resources"]["pageInfo"];

/**
 * React Query hook to fetch resources via GraphQL
 *
 * @returns {GetResources} An object containing the available queries
 */
export const useGetResources = (params: GetResourcesParams): GetResources => {
  const { pageSize, filter, sort, currentPage } = params;
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();

  const { after, before, beforeCount } = parseCurrentPage(
    currentPage || { kind: "CurrentPage", value: "" }
  );

  const pageSizeNum = Number(pageSize.value);
  const paginationVariables = before
    ? { last: pageSizeNum, before }
    : { first: pageSizeNum, ...(after ? { after } : {}) };

  const filterArray = filter ? Object.values(filter) : [];

  const execute = useGraphQLRequest();

  return {
    useContinuous: (): UseQueryResult<GetResourcesResponse, Error> =>
      useQuery({
        queryKey: getResourcesKey.list([pageSize, ...filterArray, ...sort, currentPage, env]),
        queryFn: () =>
          execute(GET_RESOURCES_QUERY, {
            filter: {
              environment: env,
              ...mapToResourceActionFilterWithInstanceLabels(filter).resourceActionFilter,
            },
            environment: env,
            ...paginationVariables,
            ...(sort.length > 0 ? { orderBy: mapSort(sort) } : {}),
          }),
        select: (data) => {
          const { resources, resourceSummary } = data;
          // TODO: https://github.com/inmanta/inmanta-core/issues/11186 the schema types totalCount, state
          // and its fields looser than the orchestrator returns them, and the summary groups as JSON.
          const totalCount = resources.totalCount ?? 0;
          const handlers = buildHandlers(resources.pageInfo, beforeCount, pageSizeNum);
          const edges = resources.edges as Resource.RawResource[];
          const afterCount = Math.max(0, totalCount - beforeCount - edges.length);

          const metadata: Pagination.Metadata = {
            total: totalCount,
            before: beforeCount,
            after: afterCount,
            page_size: pageSizeNum,
          };

          return {
            resources: edges.map((edge) => edge.node),
            resourceSummary: resourceSummary as Resource.ResourceSummary,
            metadata,
            handlers,
          };
        },

        refetchInterval: (query) => (query.state.error ? false : REFETCH_INTERVAL),
        placeholderData: keepPreviousData,
      }),
  };
};

export const getResourcesKey = new KeyFactory(SliceKeys.resource, "get_resources");
