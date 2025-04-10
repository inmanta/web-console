import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { PageSize, Pagination } from "@/Core/Domain";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { getPaginationHandlers } from "@/Data/Managers/Helpers/Pagination/getPaginationHandlers";
import { Notification, Severity } from "@S/Notification/Core/Domain";
import { Origin } from "@S/Notification/Core/Utils";
import { CustomError, useGet, REFETCH_INTERVAL } from "../../helpers";
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
  useOneTime: () => UseQueryResult<NotificationResponse, CustomError>;
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
  const get = useGet()<ResponseBody>;

  return {
    useOneTime: (): UseQueryResult<NotificationResponse, CustomError> =>
      useQuery({
        queryKey: [
          "get_notifications",
          params.pageSize.value,
          params.filter,
          params.currentPage.value,
          params.origin,
        ],
        queryFn: () => get(getUrl(params)),
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
      }),
    useContinuous: () =>
      useQuery({
        queryKey: [
          "get_notifications",
          params.pageSize.value,
          params.filter,
          params.currentPage.value,
          params.origin,
        ],
        refetchInterval: REFETCH_INTERVAL,
        queryFn: () => get(getUrl(params)),
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
      }),
  };
};
