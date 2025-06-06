import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { Environment } from "@/Core/Domain";
import { CustomError, useGraphQLRequest } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";

/**
 * Response type for the environments query through GraphQL.
 *
 * @property {Object} data - The data object containing the environments.
 * @property {Array} errors - The errors array containing any errors that occurred.
 * @property {Object} extensions - The extensions object containing any additional data.
 */
export interface PartialEnvironmentsResponse {
  data: {
    environments: {
      edges: {
        node: PartialEnvironment;
      }[];
    };
  };
  errors: string[] | null;
  extensions: Record<string, unknown>;
}

/**
 * Return Signature of the useGetPartialEnvironments React Query
 */
interface GetPartialEnvironments {
  useOneTime: () => UseQueryResult<
    {
      environments: PartialEnvironment[];
      errors: string[] | null;
      extensions: Record<string, unknown>;
    },
    CustomError
  >;
}

/**
 * Partial Environment type that represents the Environment type but with only the id, name, halted, and extra isExpertMode property.
 */
export interface PartialEnvironment extends Pick<Environment, "id" | "name" | "halted"> {
  isExpertMode: boolean;
}

/**
 * React Query hook for fetching environments using GraphQL.
 *
 * @returns GetPartialEnvironments A query result containing environments data or an error.
 */
export const useGetPartialEnvironments = (): GetPartialEnvironments => {
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

  const queryFn = useGraphQLRequest<PartialEnvironmentsResponse>(query);

  return {
    useOneTime: () =>
      useQuery({
        queryKey: getPartialEnvironmentsKey.list([]),
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

export const getPartialEnvironmentsKey = new KeyFactory(
  SliceKeys.environment,
  "get_partial_environment"
);
