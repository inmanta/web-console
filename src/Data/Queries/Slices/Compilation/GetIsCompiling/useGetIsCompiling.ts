import { useContext } from "react";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { CustomError, REFETCH_INTERVAL, useGraphQLRequest } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";
import { DependencyContext } from "@/UI/Dependency";

export interface CompilingPreview {
  isCompiling: boolean;
}

/**
 * Response type for the compiling preview query through GraphQL.
 *
 * @property {Object} data - The data object containing the isCompiling.
 * @property {string[] | null} errors - The errors array containing any errors that occurred.
 * @property {Record<string, unknown>} extensions - The extensions object containing any additional data.
 */
export interface IsCompilingResponse {
  data: {
    environments: {
      edges: {
        node: CompilingPreview;
      }[];
    };
  };
  errors: string[] | null;
  extensions: Record<string, unknown>;
}

/**
 * Return Signature of the useGetIsCompiling React Query
 */
interface GetIsCompiling {
  useContinuous: () => UseQueryResult<
    {
      compilingPreview: CompilingPreview;
      errors: string[] | null;
      extensions: Record<string, unknown>;
    },
    CustomError
  >;
}

/**
 * React Query hook for fetching compiling preview using GraphQL.
 *
 * @returns GetCompilingPreview A query result containing compiling preview data or an error.
 */
export const useGetIsCompiling = (): GetIsCompiling => {
  const { environmentHandler } = useContext(DependencyContext);
  const envId = environmentHandler.useId();

  const query = gql`
    query {
      environments(filter: { id: "${envId}" }) {
        edges {
          node {
            isCompiling
          }
        }
      }
  }
  `;

  const queryFn = useGraphQLRequest<IsCompilingResponse>(query);

  return {
    useContinuous: () =>
      useQuery({
        queryKey: getIsCompilingKey.single(envId),
        queryFn,
        refetchInterval: REFETCH_INTERVAL,
        select: (data) => {
          //in case if the environment is not found, throw an error, as query will return empty array
          if (data.data.environments.edges.length < 1) {
            throw new Error("could not find the compiling preview for given environment");
          }

          return {
            compilingPreview: data.data.environments.edges[0].node,
            errors: data.errors,
            extensions: data.extensions,
          };
        },
      }),
  };
};

export const getIsCompilingKey = new KeyFactory(SliceKeys.environment, "get_is_compiling");
