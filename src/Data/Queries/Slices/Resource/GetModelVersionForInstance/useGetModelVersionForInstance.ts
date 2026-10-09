import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { useGraphQLRequest } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";
import { DependencyContext } from "@/UI/Dependency";

/**
 * The resources of one instance version: at most one resource, with the model version it belongs
 * to.
 */
interface Response {
  data: { resources: { edges: { node: { modelVersion: number } }[] } };
}

const GET_MODEL_VERSION_FOR_INSTANCE_QUERY = gql`
  query GetModelVersionForInstance($filter: ResourceFilter!) {
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
 * React Query hook returning the model version the server resolves one version of a service
 * instance to, the same one a dry run on it uses. An instance version can be part of several model
 * versions, so there is no direct link; it is read from the instance's resources at that version,
 * which all share one model version. The result is null when there is none: that instance version
 * was never exported, or the scheduler hasn't processed it yet. Doesn't fetch until the instance
 * and version are known.
 *
 * @example useGetModelVersionForInstance("abc", 3).data // 8
 */
export const useGetModelVersionForInstance = (
  instanceId: string | undefined,
  instanceVersion: number | undefined
): UseQueryResult<number | null, Error> => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();

  const queryFn = useGraphQLRequest<Response>(GET_MODEL_VERSION_FOR_INSTANCE_QUERY, {
    filter: { environment: env, serviceInstance: [instanceId], instanceVersion },
  });

  return useQuery({
    queryKey: getModelVersionForInstanceKey.single(instanceId ?? "", [
      String(instanceVersion),
      env,
    ]),
    queryFn,
    enabled: instanceId !== undefined && instanceVersion !== undefined,
    select: (response) => response.data.resources.edges[0]?.node.modelVersion ?? null,
  });
};

export const getModelVersionForInstanceKey = new KeyFactory(
  SliceKeys.resource,
  "get_model_version_for_instance"
);
