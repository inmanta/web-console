import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { Environment } from "@/Core/Domain";
import { CustomError, REFETCH_INTERVAL, useGraphQLRequest } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";

/**
 * Environment Preview type that represents the Environment type but with only the id, name, halted, extended of isExpertMode property.
 */
export interface EnvironmentPreview extends Pick<Environment, "id" | "name" | "halted"> {
  isExpertMode: boolean;
  isCompiling: boolean;
}

/**
 * Response type for the environments preview query through GraphQL.
 *
 * @property {Object} data - The data object containing the environment previews.
 * @property {string[] | null} errors - The errors array containing any errors that occurred.
 * @property {Record<string, unknown>} extensions - The extensions object containing any additional data.
 */
export interface EnvironmentPreviewResponse {
  data: {
    environments: {
      edges: {
        node: EnvironmentPreview;
      }[];
    };
  };
  errors: string[] | null;
  extensions: Record<string, unknown>;
}

/**
 * Return Signature of the useGetEnvironmentPreview React Query
 */
interface GetEnvironmentPreview {
  useOneTime: () => UseQueryResult<
    {
      environments: EnvironmentPreview[];
      errors: string[] | null;
      extensions: Record<string, unknown>;
    },
    CustomError
  >;
}

/**
 * React Query hook for fetching environments previews using GraphQL.
 *
 * @returns GetEnvironmentPreview A query result containing environment previews data or an error.
 */
export const useGetEnvironmentPreview = (): GetEnvironmentPreview => {
  const query = gql`
    query {
      environments {
        edges {
          node {
            name
            id
            halted
            isExpertMode
            isCompiling
          }
        }
      }
    }
  `;

  const queryFn = useGraphQLRequest<EnvironmentPreviewResponse>(query);

  return {
    useOneTime: () =>
      useQuery({
        queryKey: GetEnvironmentPreviewKey.list([]),
        queryFn,
        refetchInterval: REFETCH_INTERVAL,
        select: (data) => {
          const environments = data.data.environments.edges.map((edge) => edge.node);
          return {
            environments,
            errors: data.errors,
            extensions: data.extensions,
          };
        },
      }),
  };
};

export const GetEnvironmentPreviewKey = new KeyFactory(
  SliceKeys.environment,
  "get_environment_preview"
);
