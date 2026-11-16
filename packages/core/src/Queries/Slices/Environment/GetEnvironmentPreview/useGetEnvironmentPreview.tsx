import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { graphql } from "@inmanta/web-console-core/GraphQL/generated";
import type { GetEnvironmentPreviewQuery } from "@inmanta/web-console-core/GraphQL/generated/graphql";
import {
  CustomError,
  REFETCH_INTERVAL,
  useGraphQLRequest,
} from "@inmanta/web-console-core/Queries/Helpers";
import { KeyFactory, SliceKeys } from "@inmanta/web-console-core/Queries/Helpers/KeyFactory";

const GET_ENVIRONMENT_PREVIEW_QUERY = graphql(`
  query GetEnvironmentPreview {
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
`);

/**
 * An environment with only the fields the preview query asks for.
 */
export type EnvironmentPreview =
  GetEnvironmentPreviewQuery["environments"]["edges"][number]["node"];

/**
 * Return Signature of the useGetEnvironmentPreview React Query
 */
interface GetEnvironmentPreview {
  useContinuous: () => UseQueryResult<{ environments: EnvironmentPreview[] }, CustomError>;
}

/**
 * React Query hook for fetching environments previews using GraphQL.
 *
 * @returns GetEnvironmentPreview A query result containing environment previews data or an error.
 */
export const useGetEnvironmentPreview = (): GetEnvironmentPreview => {
  const execute = useGraphQLRequest();

  return {
    useContinuous: () =>
      useQuery({
        queryKey: GetEnvironmentPreviewKey.list([]),
        queryFn: () => execute(GET_ENVIRONMENT_PREVIEW_QUERY),
        refetchInterval: REFETCH_INTERVAL,
        select: (data) => ({ environments: data.environments.edges.map((edge) => edge.node) }),
      }),
  };
};

export const GetEnvironmentPreviewKey = new KeyFactory(
  SliceKeys.environment,
  "get_environment_preview"
);
