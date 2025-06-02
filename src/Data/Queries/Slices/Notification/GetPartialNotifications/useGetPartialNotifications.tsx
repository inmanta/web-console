import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { CustomError, REFETCH_INTERVAL, useGraphQLRequest } from "@/Data/Queries";
import { Notification } from "@/Slices/Notification/Core/Domain";

interface Props {
  envID: string;
  cleared: boolean;
  orderBy: string;
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

  const queryFn = useGraphQLRequest<NotificationsResponse>(query);

  return {
    useContinuous: () =>
      useQuery({
        queryKey: ["get_notifications", "continuous", envID],
        queryFn,
        refetchInterval: REFETCH_INTERVAL,
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
