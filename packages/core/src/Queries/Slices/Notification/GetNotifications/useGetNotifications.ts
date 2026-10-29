import { useContext } from "react";
import { UseQueryResult, keepPreviousData, useQuery } from "@tanstack/react-query";
import { CurrentPage } from "@inmanta/web-console-core/Common/UrlState/useUrlStateWithCurrentPage";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { PageSize, Pagination } from "@inmanta/web-console-core/Domain";
import {
  Notification,
  NotificationOrigin,
  Severity,
} from "@inmanta/web-console-core/Domain/Notification";
import {
  CustomError,
  useGet,
  REFETCH_INTERVAL,
  getPaginationHandlers,
} from "@inmanta/web-console-core/Queries/Helpers";
import { KeyFactory, SliceKeys } from "@inmanta/web-console-core/Queries/Helpers/KeyFactory";
import { getUrl } from "./getUrl";

/**
 * Interface for filtering notifications based on various criteria
 */
export interface NotificationFilter {
  title?: string[];
  message?: string[];
  read?: boolean;
  cleared?: boolean;
  severity?: Severity;
}

/**
 * Interface for parameters required to fetch notifications
 */
export interface GetNotificationsParams {
  filter?: NotificationFilter;
  pageSize: PageSize.PageSize;
  origin: NotificationOrigin;
  currentPage: CurrentPage;
}

/**
 * Interface for the raw API response body containing notification data and pagination info
 */
interface ResponseBody {
  data: Notification[];
  links: Pagination.Links;
  metadata: Pagination.Metadata;
}

/**
 * Extended interface that includes pagination handlers for the notification response
 */
export interface NotificationResponse extends ResponseBody {
  handlers: Pagination.Handlers;
}

/**
 * Return Signature of the useGetInstance React Query
 */
interface GetNotifications {
  useContinuous: () => UseQueryResult<NotificationResponse, CustomError>;
}

/**
 * React Query hook for fetching notifications.
 *
 * @param {GetNotificationsParams} params - Parameters for fetching notifications
 * @param {UseQueryOptions} options - Additional options for the query
 * @returns {UseQueryResult} A query result containing notifications data or an error
 */
export const useGetNotifications = (params: GetNotificationsParams): GetNotifications => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<ResponseBody>;

  return {
    useContinuous: () =>
      useQuery({
        // The filter stays an object in the key, so the same value on different fields
        // (title "abc", message "abc") gets a different key.
        queryKey: getNotificationsKey.list([...Object.values(params), env]),
        refetchInterval: (query) => (query.state.error ? false : REFETCH_INTERVAL),
        placeholderData: keepPreviousData,
        queryFn: () => get(getUrl(params)),
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
      }),
  };
};

export const getNotificationsKey = new KeyFactory(SliceKeys.notification, "get_notifications");
