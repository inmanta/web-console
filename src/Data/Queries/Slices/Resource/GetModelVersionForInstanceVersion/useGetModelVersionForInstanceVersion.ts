import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { useGraphQLRequest } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";
import { DependencyContext } from "@/UI/Dependency";

/**
 * The first resource of one instance version, with the model version it belongs to. The query asks
 * for only one, since all of them share that model version. Empty when there is none.
 */
interface Response {
  data: { resources: { edges: { node: { modelVersion: number } }[] } };
}

const GET_MODEL_VERSION_FOR_INSTANCE_VERSION_QUERY = gql`
  query GetModelVersionForInstanceVersion($filter: ResourceFilter!) {
    resources(filter: $filter, first: 1) {
      edges {
        node {
          modelVersion
        }
      }
    }
  }
`;

/**
 * React Query hook returning the model version that one instance version of a service instance
 * maps to, the same one a dry run on it uses. An instance version can be part of several model
 * versions, so there is no direct link; it is read from the instance's resources at that instance
 * version, which all share one model version. The result is null when there is none:
 * that instance version was never exported, or the scheduler hasn't processed it yet. Doesn't
 * fetch until the instance id and instance version are known.
 *
 * @example useGetModelVersionForInstanceVersion("abc", 3).data // 8
 */
export const useGetModelVersionForInstanceVersion = (
  instanceId: string | undefined,
  instanceVersion: number | undefined
): UseQueryResult<number | null, Error> => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();

  const queryFn = useGraphQLRequest<Response>(GET_MODEL_VERSION_FOR_INSTANCE_VERSION_QUERY, {
    filter: { environment: env, serviceInstance: [instanceId], instanceVersion },
  });

  return useQuery({
    queryKey: getModelVersionForInstanceVersionKey.single(instanceId ?? "", [
      String(instanceVersion),
      env,
    ]),
    queryFn,
    enabled: instanceId !== undefined && instanceVersion !== undefined,
    select: (response) => response.data.resources.edges[0]?.node.modelVersion ?? null,
  });
};

export const getModelVersionForInstanceVersionKey = new KeyFactory(
  SliceKeys.resource,
  "get_model_version_for_instance_version"
);
