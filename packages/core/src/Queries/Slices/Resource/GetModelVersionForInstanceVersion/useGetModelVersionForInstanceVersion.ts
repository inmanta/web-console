import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { graphql } from "@inmanta/web-console-core/GraphQL/generated";
import { useGraphQLRequest } from "@inmanta/web-console-core/Queries/Helpers";
import { KeyFactory, SliceKeys } from "@inmanta/web-console-core/Queries/Helpers/KeyFactory";

/**
 * Asks for the first resource of one instance version, with the model version it belongs to. One is
 * enough, since all of them share that model version. Empty when there is none.
 */
const GET_MODEL_VERSION_FOR_INSTANCE_VERSION_QUERY = graphql(`
  query GetModelVersionForInstanceVersion($filter: ResourceFilter!) {
    resources(filter: $filter, first: 1) {
      edges {
        node {
          modelVersion
        }
      }
    }
  }
`);

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

  const execute = useGraphQLRequest();

  return useQuery({
    queryKey: getModelVersionForInstanceVersionKey.single(instanceId ?? "", [
      String(instanceVersion),
      env,
    ]),
    queryFn: () =>
      execute(GET_MODEL_VERSION_FOR_INSTANCE_VERSION_QUERY, {
        filter: { environment: env, serviceInstance: [instanceId ?? ""], instanceVersion },
      }),
    enabled: instanceId !== undefined && instanceVersion !== undefined,
    select: (data) => data.resources.edges[0]?.node.modelVersion ?? null,
  });
};

export const getModelVersionForInstanceVersionKey = new KeyFactory(
  SliceKeys.resource,
  "get_model_version_for_instance_version"
);
