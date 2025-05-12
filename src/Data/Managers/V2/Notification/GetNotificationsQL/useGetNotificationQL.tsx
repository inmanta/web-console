import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { useCreateGraphQLRequest } from "../../helpers/useGraphQL";

interface Props {
  envID: string;
  cleared: boolean;
  orderBy: string;
}
export interface NotificationQL {
  node: {
    title: string;
    severity: string;
    read: boolean;
  };
}

export interface NotificationQLResponse {
  data: {
    notifications: {
      edges: NotificationQL[];
    };
  };
  errors: string[] | null;
  extenstions: Record<string, unknown>;
}

/**
 * React Query hook for fetching notifications using GraphQL.
 *
 * @param {Props} props - The props object containing environment ID, cleared status, and order by.
 * @returns {UseQueryResult<NotificationResponse, Error>} A query result containing notifications data or an error.
 */
export const useGetNotificationQL = ({
  envID,
  cleared,
  orderBy,
}: Props): UseQueryResult<NotificationQLResponse, Error> => {
  const query = gql`
    query {
      notifications(
        filter: { cleared: ${cleared}, environment: "${envID}" }
        orderBy: { created: "${orderBy}" }
      ) {
        edges {
          node {
            title
            severity
            read
          }
        }
      }
    }
  `;

  const queryFn = useCreateGraphQLRequest<NotificationQLResponse>(query);

  return useQuery({
    queryKey: ["graphQL", "get_notifications", "continuous", envID],
    queryFn,
    refetchInterval: 5000,
  });
};
