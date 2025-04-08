import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { PageSize, Pagination } from "@/Core/Domain";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { getPaginationHandlers } from "@/Data/Managers/Helpers/Pagination/getPaginationHandlers";
import { ResourceLog, ResourceLogFilter } from "@S/ResourceDetails/Core/ResourceLog";
import { useGet } from "../../helpers";
import { getUrl } from "./getUrl";

/**
 * Interface for parameters required to fetch resource logs
 */
export interface GetResourceLogsParams {
  id: string;
  filter?: ResourceLogFilter;
  pageSize: PageSize.PageSize;
  currentPage: CurrentPage;
  sort?: {
    name: string;
    order: "asc" | "desc";
  };
}

/**
 * Interface for the raw API response body containing log data and pagination info
 */
interface ResponseBody {
  data: ResourceLog[];
  links: Pagination.Links;
  metadata: Pagination.Metadata;
}

/**
 * Extended interface that includes pagination handlers for the log response
 */
export interface ResourceLogsResponse extends ResponseBody {
  handlers: Pagination.Handlers;
}

/**
 * Return signature of the useGetResourceLogs React Query hook
 */
interface GetResourceLogs {
  useOneTime: () => UseQueryResult<ResourceLogsResponse, Error>;
  useContinuous: () => UseQueryResult<ResourceLogsResponse, Error>;
}

/**
 * React Query hook to fetch logs for a specific resource
 *
 * @returns {GetResourceLogs} An object containing the available queries
 * @returns {UseQueryResult<ResourceLogsResponse, Error>} returns.useOneTime - Fetch the resource logs with a single query
 * @returns {UseQueryResult<ResourceLogsResponse, Error>} returns.useContinuous - Fetch the resource logs with a recurrent query with an interval of 5s
 */
export const useGetResourceLogs = (params: GetResourceLogsParams): GetResourceLogs => {
  const { id, filter, pageSize, sort, currentPage } = params;
  const url = getUrl({
    id,
    filter,
    pageSize,
    sort,
    currentPage: currentPage || { kind: "CurrentPage", value: "" },
  });
  const get = useGet()<ResponseBody>;

  return {
    useOneTime: (): UseQueryResult<ResourceLogsResponse, Error> =>
      useQuery({
        queryKey: ["get_resource_logs-one_time", id, pageSize, filter, sort, currentPage],
        queryFn: () => get(url),
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
      }),
    useContinuous: (): UseQueryResult<ResourceLogsResponse, Error> =>
      useQuery({
        queryKey: ["get_resource_logs-continuous", id, pageSize, filter, sort, currentPage],
        queryFn: () => get(url),
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
        refetchInterval: 5000,
      }),
  };
};
