import { useContext } from "react";
import { UseQueryResult, keepPreviousData, useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { PageSize, Resource, Sort } from "@/Core/Domain";
import { Handlers } from "@/Core/Domain/Pagination/Pagination";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { useGraphQLRequest, REFETCH_INTERVAL } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";
import { DependencyContext } from "@/UI/Dependency";

/**
 * Interface for filtering resources
 */
interface Filter {
  agent?: string[];
  status?: string[];
  type?: string[];
  value?: string[];
}

/**
 * Result interface for the resources API response
 */
interface Result {
  data: Resource.Resource[];
  metadata: Resource.Metadata;
}

export interface GetResourcesResponse extends Result {
  handlers: Handlers;
}

/**
 * Return signature of the useGetResources React Query hook
 */
interface GetResources {
  useContinuous: () => UseQueryResult<GetResourcesResponse, Error>;
}

export interface GetResourcesParams {
  pageSize: PageSize.PageSize;
  filter: Filter;
  sort?: Sort.Type<Resource.SortKey>;
  currentPage: CurrentPage;
}

/**
 * GraphQL response type for the resources query
 */
interface ResourcesGraphQLResponse {
  data: {
    resources: {
      totalCount: number;
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
      edges: Array<{
        node: {
          resourceId: string;
          resourceType: string;
          agent: string;
          resourceIdValue: string;
          requiresLength: number;
          state: {
            lastNonDeployingStatus: string;
          } | null;
        };
      }>;
    };
    resourceSummary: {
      totalCount: number;
      lastHandlerRun: string | null;
      blocked: number;
      compliance: number;
      isDeploying: boolean;
    };
  };
}

const GET_RESOURCES_QUERY = gql`
  query (
    $filter: ResourceFilter!
    $environment: String!
    $first: Int
    $after: String
    $orderBy: [StrawberryOrder!]
  ) {
    resourceSummary(
       environment: $environment
      ) {
       totalCount,
       lastHandlerRun,
       blocked,
       compliance,
       isDeploying
    }
    resources(filter: $filter, first: $first, after: $after, orderBy: $orderBy) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          resourceId
          resourceType
          agent
          resourceIdValue
          requiresLength
          state {
            lastNonDeployingStatus
          }
        }
      }
    }
  }
`;

/**
 * Maps a filter.status array to GraphQL ResourceFilter fields.
 * Supports orphaned/!orphaned mapping. Other status values are not
 * supported by the GraphQL ResourceFilter and are silently ignored.
 */
function mapStatusToGraphQLFilter(status: string[] | undefined): { isOrphan?: boolean } {
  if (!status || status.length === 0) return {};

  for (const s of status) {
    if (s === "!orphaned") return { isOrphan: false };
    if (s === "orphaned") return { isOrphan: true };
  }

  return {};
}

/**
 * Maps sort parameters to the GraphQL orderBy format.
 */
function mapSort(
  sort: Sort.Type<Resource.SortKey> | undefined
): Array<{ key: string; order: string }> | undefined {
  if (!sort) return undefined;

  return [{ key: sort.name, order: sort.order }];
}

/**
 * Parses the currentPage URL state value into a GraphQL after-cursor and before-offset.
 * Format: "" (first page) or "after=<cursor>&before=<N>"
 */
function parseCurrentPage(currentPage: CurrentPage): {
  after: string | undefined;
  before: number;
} {
  if (!currentPage.value) {
    return { after: undefined, before: 0 };
  }

  const params = new URLSearchParams(currentPage.value);
  const after = params.get("after") ?? undefined;
  const before = parseInt(params.get("before") ?? "0", 10);

  return { after, before };
}

/**
 * Builds pagination handlers from GraphQL pageInfo.
 */
function buildHandlers(
  pageInfo: { hasNextPage: boolean; endCursor: string | null },
  currentBefore: number,
  pageSize: number
): Handlers {
  const nextBefore = currentBefore + pageSize;
  const next =
    pageInfo.hasNextPage && pageInfo.endCursor
      ? `after=${pageInfo.endCursor}&before=${nextBefore}`
      : undefined;

  return { next };
}

/**
 * Temporary mock for deploy_summary until resourceSummary is wired up.
 * Returns fixed placeholder values to keep the progress bar functional.
 */
function mockDeploySummary(
  _resources: Resource.Resource[],
  total: number
): Resource.DeploySummary {
  return {
    total,
    by_state: {
      deployed: Math.floor(total * 0.7),
      deploying: Math.floor(total * 0.1),
      failed: Math.floor(total * 0.1),
      skipped: Math.floor(total * 0.1),
    },
  };
}

/**
 * React Query hook to fetch resources via GraphQL
 *
 * @returns {GetResources} An object containing the available queries
 */
export const useGetResources = (params: GetResourcesParams): GetResources => {
  const { pageSize, filter, sort, currentPage } = params;
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();

  const { after, before: currentBefore } = parseCurrentPage(
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

  const variables: Record<string, unknown> = {
    filter: graphqlFilter,
    environment: env,
    first: Number(pageSize.value),
    ...(after ? { after } : {}),
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
        select: (data): GetResourcesResponse => {
          const { resources } = data.data;
          const pageSize_ = Number(pageSize.value);
          const totalCount = resources.totalCount;

          const mappedResources: Resource.Resource[] = resources.edges.map(({ node }) => ({
            resource_id: node.resourceId,
            requires: [],
            requiresLength: node.requiresLength,
            status: (node.state?.lastNonDeployingStatus ?? "undefined") as Resource.Status,
            id_details: {
              resource_type: node.resourceType,
              agent: node.agent,
              attribute: "",
              resource_id_value: node.resourceIdValue,
            },
          }));

          const handlers = buildHandlers(resources.pageInfo, currentBefore, pageSize_);

          const afterCount = Math.max(0, totalCount - currentBefore - mappedResources.length);

          const metadata: Resource.Metadata = {
            total: totalCount,
            before: currentBefore,
            after: afterCount,
            page_size: pageSize_,
            deploy_summary: mockDeploySummary(mappedResources, totalCount),
          };

          return {
            data: mappedResources,
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
