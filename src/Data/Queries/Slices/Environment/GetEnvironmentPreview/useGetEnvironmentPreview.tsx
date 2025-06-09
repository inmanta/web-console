import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { Environment } from "@/Core/Domain";
import { CustomError, useGraphQLRequest } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";

/**
 * Partial Environment type that represents the Environment type but with only the id, name, halted, and extra isExpertMode property.
 */
export interface EnvironmentPreview extends Pick<Environment, "id" | "name" | "halted"> {
  isExpertMode: boolean;
}

/**
 * Response type for the environments query through GraphQL.
 *
 * @property {Object} data - The data object containing the environments.
 * @property {Array} errors - The errors array containing any errors that occurred.
 * @property {Object} extensions - The extensions object containing any additional data.
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
 * React Query hook for fetching environments using GraphQL.
 *
 * @returns GetEnvironmentPreview A query result containing environments data or an error.
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
  "get_partial_environment"
);
