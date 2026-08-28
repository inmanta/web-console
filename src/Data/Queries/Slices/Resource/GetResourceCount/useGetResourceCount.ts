import { useContext } from "react";
import { UseQueryResult, keepPreviousData, useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { ResourceActionFilter, useGraphQLRequest, REFETCH_INTERVAL } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";
import { DependencyContext } from "@/UI/Dependency";

/**
 * GraphQL response for the resource-count query.
 */
interface CountResponse {
  data: {
    resources: {
      totalCount: number;
    };
  };
}

const COUNT_RESOURCES_QUERY = gql`
  query CountResources($filter: ResourceFilter!) {
    resources(filter: $filter) {
      totalCount
    }
  }
`;

/**
 * React Query hook that resolves how many resources match a {@link ResourceActionFilter}.
 *
 * Used by the deploy confirmation dialog to show the size of the scope an action will affect,
 * for both the active filter and the whole environment. It reuses the resources GraphQL query's
 * totalCount, so the console counts exactly what the server would act on.
 *
 * @param {ResourceActionFilter} filter - The scope to count
 * @returns {UseQueryResult<number, Error>} The number of matched resources
 */
export const useGetResourceCount = (
  filter: ResourceActionFilter
): UseQueryResult<number, Error> => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();

  const queryFn = useGraphQLRequest<CountResponse>(COUNT_RESOURCES_QUERY, {
    filter: { environment: env, ...filter },
  });

  return useQuery({
    queryKey: getResourceCountKey.list([env, JSON.stringify(filter)]),
    queryFn,
    select: (data) => data.data.resources.totalCount,
    refetchInterval: (query) => (query.state.error ? false : REFETCH_INTERVAL),
    placeholderData: keepPreviousData,
  });
};

export const getResourceCountKey = new KeyFactory(SliceKeys.resource, "get_resource_count");
