import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { CustomError, REFETCH_INTERVAL, useGraphQLRequest } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";
import { Notification } from "@/Slices/Notification/Core/Domain";

interface Props {
  envID: string;
  cleared: boolean;
  orderBy: Array<{ key: string; order: string }>;
}

/**
 * Response type for the notifications query through GraphQL.
 *
 * @property {Object} data - The data object containing the notifications.
 * @property {Array} errors - The errors array containing any errors that occurred.
 * @property {Object} extensions - The extensions object containing any additional data.
 */
export interface NotificationsResponse {
  data: {
    notifications: {
      edges: {
        node: PartialNotification;
      }[];
    };
  };
  errors: string[] | null;
  extensions: Record<string, unknown>;
}

/**
 * Return Signature of the useGetInstance React Query
 */
interface GetNotifications {
  useContinuous: () => UseQueryResult<
    {
      notifications: PartialNotification[];
      errors: string[] | null;
      extensions: Record<string, unknown>;
    },
    CustomError
  >;
}

/**
 * Partial Notification type that represents the Notification type but with only the title, severity, and read properties.
 */
export type PartialNotification = Pick<Notification, "title" | "severity" | "read">;

/**
 * Converts an orderBy array to GraphQL syntax.
 * This is a temporary workaround to support the orderBy array in the query.
 * TODO: Remove this once the backend supports graphql variables.
 * https://github.com/inmanta/web-console/issues/6587
 *
 * @param {Array<{ key: string; order: string }>} orderBy - Array of order by objects
 * @returns {string} GraphQL formatted orderBy string
 */
const formatOrderBy = (orderBy: Array<{ key: string; order: string }>): string => {
  const formatted = orderBy
    .map((item) => `{key: "${item.key}", order: "${item.order}"}`)
    .join(", ");
  return `[${formatted}]`;
};

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
  const orderByString = formatOrderBy(orderBy);

  const query = gql`
    query {
      notifications(
        filter: { cleared: ${cleared}, environment: "${envID}" }
        orderBy: ${orderByString}
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

  const queryFn = useGraphQLRequest<NotificationsResponse>(query);

  return {
    useContinuous: () =>
      useQuery({
        queryKey: GetPartialNotificationsKey.list([envID]),
        queryFn,
        refetchInterval: (query) => (query.state.error ? false : REFETCH_INTERVAL),
        select: (data) => {
          const notifications = data.data.notifications.edges.map((edge) => edge.node);
          return {
            notifications,
            errors: data.errors,
            extensions: data.extensions,
          };
        },
      }),
  };
};

export const GetPartialNotificationsKey = new KeyFactory(
  SliceKeys.notification,
  "get_partial_notifications"
);
