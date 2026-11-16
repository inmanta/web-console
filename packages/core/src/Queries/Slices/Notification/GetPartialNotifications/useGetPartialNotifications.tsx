import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { graphql } from "@inmanta/web-console-core/GraphQL/generated";
import type {
  GetPartialNotificationsQuery,
  StrawberryOrder,
} from "@inmanta/web-console-core/GraphQL/generated/graphql";
import {
  CustomError,
  REFETCH_INTERVAL,
  useGraphQLRequest,
} from "@inmanta/web-console-core/Queries/Helpers";
import { KeyFactory, SliceKeys } from "@inmanta/web-console-core/Queries/Helpers/KeyFactory";

interface Props {
  envID: string;
  cleared: boolean;
  orderBy: StrawberryOrder[];
}

const GET_PARTIAL_NOTIFICATIONS_QUERY = graphql(`
  query GetPartialNotifications($filter: NotificationFilter!, $orderBy: [StrawberryOrder!]) {
    notifications(filter: $filter, orderBy: $orderBy) {
      edges {
        node {
          title
          severity
          read
        }
      }
    }
  }
`);

/**
 * A notification with only the fields the partial notifications query asks for.
 */
export type PartialNotification =
  GetPartialNotificationsQuery["notifications"]["edges"][number]["node"];

/**
 * Return Signature of the useGetPartialNotifications React Query
 */
interface GetNotifications {
  useContinuous: () => UseQueryResult<{ notifications: PartialNotification[] }, CustomError>;
}

/**
 * React Query hook for fetching notifications using GraphQL.
 *
 * @param {Props} props - The props object containing environment ID, cleared status, and order by.
 * @returns GetNotifications A query result containing notifications data or an error.
 */
export const useGetPartialNotifications = ({
  envID,
  cleared,
  orderBy,
}: Props): GetNotifications => {
  const execute = useGraphQLRequest();

  return {
    useContinuous: () =>
      useQuery({
        queryKey: GetPartialNotificationsKey.list([envID]),
        queryFn: () =>
          execute(GET_PARTIAL_NOTIFICATIONS_QUERY, {
            filter: { cleared, environment: envID },
            orderBy,
          }),
        refetchInterval: (query) => (query.state.error ? false : REFETCH_INTERVAL),
        select: (data) => ({ notifications: data.notifications.edges.map((edge) => edge.node) }),
      }),
  };
};

export const GetPartialNotificationsKey = new KeyFactory(
  SliceKeys.notification,
  "get_partial_notifications"
);
