import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { PageSize, Pagination } from "@/Core/Domain";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { CustomError, useGet, REFETCH_INTERVAL, getPaginationHandlers } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";
import { DependencyContext } from "@/UI/Dependency";
import { Notification, Severity } from "@S/Notification/Core/Domain";
import { Origin } from "@S/Notification/Core/Utils";
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
  origin: Origin;
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
  const filter = params.filter ? Object.values(params.filter) : [];

  return {
    useContinuous: () =>
      useQuery({
        queryKey: getNotificationsKey.list([
          params.pageSize,
          ...filter,
          params.currentPage,
          params.origin,
          env,
        ]),
        refetchInterval: (query) => (query.state.error ? false : REFETCH_INTERVAL),
        queryFn: () => get(getUrl(params)),
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
      }),
  };
};

export const getNotificationsKey = new KeyFactory(SliceKeys.notification, "get_notifications");
