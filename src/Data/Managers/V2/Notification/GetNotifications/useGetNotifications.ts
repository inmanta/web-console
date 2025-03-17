import {
  UseQueryResult,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { PageSize, Pagination } from "@/Core/Domain";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { getPaginationHandlers } from "@/Data/Managers/Helpers/Pagination/getPaginationHandlers";
import { Notification, Severity } from "@S/Notification/Core/Domain";
import { Origin } from "@S/Notification/Core/Utils";
import { useGet } from "../../helpers";
import { getUrl } from "./getUrl";

export interface NotificationFilter {
  title?: string[];
  message?: string[];
  read?: boolean;
  cleared?: boolean;
  severity?: Severity;
}

export interface GetNotificationsParams {
  filter?: NotificationFilter;
  pageSize: PageSize.PageSize;
  origin: Origin;
  currentPage: CurrentPage;
}

interface ResponseBody {
  data: Notification[];
  links: Pagination.Links;
  metadata: Pagination.Metadata;
}

export interface NotificationResponse extends ResponseBody {
  handlers: Pagination.Handlers;
}

/**
 * Return Signature of the useGetInstance React Query
 */
interface GetNotifications {
  useOneTime: () => UseQueryResult<NotificationResponse, Error>;
  useContinuous: () => UseQueryResult<NotificationResponse, Error>;
}

/**
 * React Query hook for fetching notifications.
 *
 * @param {GetNotificationsParams} params - Parameters for fetching notifications
 * @param {UseQueryOptions} options - Additional options for the query
 * @returns {UseQueryResult} A query result containing notifications data or an error
 */
export const useGetNotifications = (
  params: GetNotificationsParams,
  options?: UseQueryOptions<NotificationResponse, Error>,
): GetNotifications => {
  const get = useGet()<ResponseBody>;

  return {
    useOneTime: (): UseQueryResult<NotificationResponse, Error> =>
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
        ...options,
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
        refetchInterval: 5000,
        queryFn: () => get(getUrl(params)),
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
        ...options,
      }),
  };
};
