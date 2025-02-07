import {
  UseInfiniteQueryResult,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { Pagination } from "@/Core";
import { InstanceLog } from "@/Core/Domain/HistoryLog";
import { useGet } from "../../helpers";

export interface LogsResponse {
  data: InstanceLog[];
  links: Pagination.Links;
  metadata: Pagination.Metadata;
}

/**
 * Return Signature of the useGetInfiniteInstanceLogs React Query
 */
interface GetInfiniteInstanceLogs {
  useContinuous: (
    selectedVersion: string,
  ) => UseInfiniteQueryResult<InstanceLog[], Error>;
}

/**
 * React Infinite Query hook to fetch a the history logs for an instance
 *
 * @param service {string} - the service entity
 * @param instanceId {string} - the instance ID for which the data needs to be fetched.
 *
 * @returns {GetInfiniteInstanceLogs} An object containing the different available queries.
 * @returns {UseInfiniteQueryResult<InstanceLog[], Error>} returns.useOneTime - Fetch the logs with a single query.
 * @returns {UseInfiniteQueryResult<InstanceLog[], Error>} returns.useContinuous - Fetch the logs with a recursive query with an interval of 5s.
 */
export const useGetInfiniteInstanceLogs = (
  service: string,
  instance: string,
): GetInfiniteInstanceLogs => {
  const get = useGet()<LogsResponse>;

  return {
    useContinuous: (
      selectedVersion: string,
    ): UseInfiniteQueryResult<InstanceLog[], Error> =>
      useInfiniteQuery({
        queryKey: ["get_instance_logs-continuous", service, instance],
        queryFn: ({ pageParam }) => {
          const initialParameters = selectedVersion
            ? `limit=50&end=${Number(selectedVersion) + 1}`
            : "limit=50";

          return get(
            `/lsm/v1/service_inventory/${service}/${instance}/log?${pageParam ? pageParam : initialParameters}`,
          );
        },
        refetchInterval: 5000,
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
  };
};
