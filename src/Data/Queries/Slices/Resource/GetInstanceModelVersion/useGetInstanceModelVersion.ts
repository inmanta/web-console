import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { useGraphQLRequest } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";
import { DependencyContext } from "@/UI/Dependency";

/**
 * The resources lookup at one instance version: at most one resource, with the model version it
 * was resolved at.
 */
interface Response {
  data: { resources: { edges: { node: { modelVersion: number } }[] } };
}

const GET_INSTANCE_MODEL_VERSION_QUERY = gql`
  query GetInstanceModelVersion($filter: ResourceFilter!) {
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
 * React Query hook resolving the model version behind one version of a service instance. It asks
 * the server for the instance's resources at that version, so the mapping is the one a dry run on
 * it uses. The result is null when it maps to none: that version's desired state was never
 * exported, or the scheduler has not processed it yet. It stays idle until both ids are known.
 *
 * @example useGetInstanceModelVersion("abc", 3).data // 8
 */
export const useGetInstanceModelVersion = (
  instanceId: string | undefined,
  instanceVersion: number | undefined
): UseQueryResult<number | null, Error> => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();

  const queryFn = useGraphQLRequest<Response>(GET_INSTANCE_MODEL_VERSION_QUERY, {
    filter: { environment: env, serviceInstance: [instanceId], instanceVersion },
  });

  return useQuery({
    queryKey: getInstanceModelVersionKey.single(instanceId ?? "", [String(instanceVersion), env]),
    queryFn,
    enabled: instanceId !== undefined && instanceVersion !== undefined,
    select: (response) => response.data.resources.edges[0]?.node.modelVersion ?? null,
  });
};

export const getInstanceModelVersionKey = new KeyFactory(
  SliceKeys.resource,
  "get_instance_model_version"
);
