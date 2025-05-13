import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { Notification, Severity } from "@/Slices/Notification/Core/Domain";
import { CustomError } from "../../helpers";
import { useGraphQLRequest } from "../../helpers/useGraphQL";

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
export interface NotificationQLResponse {
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
  useContinuous: () => UseQueryResult<NotificationQueryResponse, CustomError>;
}

/**
 * Partial Notification type that represents the Notification type but with only the title, severity, and read properties.
 */
export type PartialNotification = Pick<Notification, "title" | "severity" | "read">;

/**
 * Response of the useGetNotificationQL hook after it has been processed.
 *
 * @property {PartialNotification[]} data - The data object containing the notifications.
 * @property {string[] | null} errors - The errors array containing any errors that occurred.
 * @property {Record<string, unknown>} extensions - The extensions object containing any additional data.
 */
export interface NotificationQueryResponse {
  notifications: PartialNotification[];
  errors: string[] | null;
  extensions: Record<string, unknown>;
}

/**
 * React Query hook for fetching notifications using GraphQL.
 *
 * @param {Props} props - The props object containing environment ID, cleared status, and order by.
 * @returns GetNotifications A query result containing notifications data or an error.
 */
export const useGetNotificationQL = ({ envID, cleared, orderBy }: Props): GetNotifications => {
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

  const queryFn = useGraphQLRequest<NotificationQLResponse>(query);

  return {
    useContinuous: () =>
      useQuery({
        queryKey: ["get_notifications", "continuous", envID],
        queryFn,
        refetchInterval: 5000,
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
