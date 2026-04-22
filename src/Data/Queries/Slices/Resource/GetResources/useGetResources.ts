import { useContext } from "react";
import { UseQueryResult, keepPreviousData, useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { PageSize, Pagination, Resource, Sort } from "@/Core/Domain";
import { Handlers } from "@/Core/Domain/Pagination/Pagination";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { useGraphQLRequest, REFETCH_INTERVAL } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";
import { DependencyContext } from "@/UI/Dependency";
import { buildHandlers, mapSort, mapStatusToGraphQLFilter, parseCurrentPage } from "./helpers";

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  endCursor: string | null;
  startCursor: string | null;
}

/**
 * GraphQL response type for the resources query
 */
interface ResourcesGraphQLResponse {
  data: {
    resources: {
      totalCount: number;
      pageInfo: PageInfo;
      edges: Resource.RawResource[];
    };
    resourceSummary: Resource.ResourceSummary;
  };
}

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

/**
 * Interface for filtering resources
 */
interface Filter {
  agent?: string[];
  status?: string[];
  type?: string[];
  value?: string[];
}

interface GetResourcesParams {
  pageSize: PageSize.PageSize;
  filter: Filter;
  sort?: Sort.Type<Resource.SortKey>;
  currentPage: CurrentPage;
}

const GET_RESOURCES_QUERY = gql`
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
`;

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

  const statusFilter = mapStatusToGraphQLFilter(filter?.status);

  const graphqlFilter: Record<string, unknown> = {
    environment: env,
    ...(filter?.type?.length ? { resourceType: { eq: filter.type } } : {}),
    ...(filter?.agent?.length ? { agent: { eq: filter.agent } } : {}),
    ...(filter?.value?.length ? { resourceIdValue: { contains: filter.value } } : {}),
    ...statusFilter,
  };

  const pageSizeNum = Number(pageSize.value);
  const paginationVariables = before
    ? { last: pageSizeNum, before }
    : { first: pageSizeNum, ...(after ? { after } : {}) };

  const variables: Record<string, unknown> = {
    filter: graphqlFilter,
    environment: env,
    ...paginationVariables,
    ...(sort ? { orderBy: mapSort(sort) } : {}),
  };

  const filterArray = filter ? Object.values(filter) : [];
  const sortArray = sort ? [sort] : [];

  const queryFn = useGraphQLRequest<ResourcesGraphQLResponse>(GET_RESOURCES_QUERY, variables);

  return {
    useContinuous: (): UseQueryResult<GetResourcesResponse, Error> =>
      useQuery({
        queryKey: getResourcesKey.list([pageSize, ...filterArray, ...sortArray, currentPage, env]),
        queryFn,
        select: (data) => {
          const { resources, resourceSummary } = data.data;
          const totalCount = resources.totalCount;
          const handlers = buildHandlers(resources.pageInfo, beforeCount, pageSizeNum);
          const edges = resources?.edges || [];
          const afterCount = Math.max(0, totalCount - beforeCount - edges.length);

          const metadata: Pagination.Metadata = {
            total: totalCount,
            before: beforeCount,
            after: afterCount,
            page_size: pageSizeNum,
          };

          return {
            resources: edges.map((edge) => edge.node),
            resourceSummary,
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
