import { useContext } from "react";
import { UseInfiniteQueryResult, useInfiniteQuery } from "@tanstack/react-query";
import { PageSize, Pagination } from "@/Core";
import { InstanceLog } from "@/Core/Domain/HistoryLog";
import { CustomError, useGet, REFETCH_INTERVAL } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";
import { DependencyContext } from "@/UI/Dependency";

interface LogsResponse {
  data: InstanceLog[];
  links: Pagination.Links;
  metadata: Pagination.Metadata;
}

/**
 * Return signature of the useGetInstanceLogs React Query hook: the history up to a selected
 * instance version, polled, or the full history newest first, fetched once.
 */
interface GetInstanceLogs {
  useContinuous: (
    selectedInstanceVersion: string
  ) => UseInfiniteQueryResult<InstanceLog[], CustomError>;
  useOneTime: () => UseInfiniteQueryResult<InstanceLog[], CustomError>;
}

/**
 * React Infinite Query hook fetching the history logs of a service instance, one per instance
 * version, a page at a time. Doesn't fetch until the service entity and instance id are known.
 *
 * @example useGetInstanceLogs("lsp", "abc").useOneTime().data // [{ version: 5, state: "up", ... }, { version: 4, ... }]
 */
export const useGetInstanceLogs = (
  serviceEntity: string | undefined,
  instanceId: string | undefined
): GetInstanceLogs => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<LogsResponse>;
  const url = `/lsm/v1/service_inventory/${serviceEntity}/${instanceId}/log`;
  const enabled = serviceEntity !== undefined && instanceId !== undefined;
  const serviceKey = { service: serviceEntity ?? "" };
  const instanceKey = { instance: instanceId ?? "" };

  return {
    useContinuous: (
      selectedInstanceVersion: string
    ): UseInfiniteQueryResult<InstanceLog[], CustomError> =>
      useInfiniteQuery({
        queryKey: getInstanceLogsKey.list([serviceKey, instanceKey, env]),
        queryFn: ({ pageParam }) => {
          const initialParameters = selectedInstanceVersion
            ? `limit=50&end=${Number(selectedInstanceVersion) + 1}`
            : "limit=50";

          return get(`${url}?${pageParam ? pageParam : initialParameters}`);
        },
        enabled,
        refetchInterval: (query) => (query.state.error ? false : REFETCH_INTERVAL),
        select: (data) => {
          return data.pages.flatMap((page) => page.data);
        },
        getPreviousPageParam: (lastPage, _pages) => {
          if (!lastPage.links.prev) {
            return undefined;
          }

          return lastPage.links.prev.split("?")[1];
        },
        getNextPageParam: (lastPage, _pages) => {
          if (!lastPage.links.next) {
            return undefined;
          }

          return lastPage.links.next.split("?")[1];
        },
        initialPageParam: "",
      }),
    useOneTime: (): UseInfiniteQueryResult<InstanceLog[], CustomError> =>
      useInfiniteQuery({
        queryKey: getInstanceLogsKey.list([serviceKey, instanceKey, { sort: "version.desc" }, env]),
        queryFn: ({ pageParam }) => get(`${url}?${pageParam}`),
        initialPageParam: `limit=${PageSize.initial.value}&sort=version.desc`,
        getNextPageParam: (lastPage) => lastPage.links.next?.split("?")[1],
        enabled,
        select: (data) => data.pages.flatMap((page) => page.data),
        // A refetch reloads every loaded page, so it doesn't happen on each return to the window.
        refetchOnWindowFocus: false,
      }),
  };
};

export const getInstanceLogsKey = new KeyFactory(SliceKeys.serviceInstance, "get_instance_logs");
