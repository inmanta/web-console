import {
  UseInfiniteQueryResult,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { Pagination } from "@/Core";
import { InstanceLog } from "@/Core/Domain/HistoryLog";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../../helpers";

export interface LogsResponse {
  data: InstanceLog[];
  links: Pagination.Links;
  metadata: Pagination.Metadata;
}

/**
 * Return Signature of the useGetInstanceLogs React Query
 */
interface GetInstanceLogs {
  useContinuous: (
    selectedVersion: string,
  ) => UseInfiniteQueryResult<InstanceLog[], Error>;
}

/**
 * React Infinite Query hook to fetch a the history logs for an instance
 *
 * @param service {string} - the service entity
 * @param instanceId {string} - the instance ID for which the data needs to be fetched.
 * @param environment {string} - the environment in which the instance belongs
 *
 * @returns {GetInstanceLogs} An object containing the different available queries.
 * @returns {UseInfiniteQueryResult<InstanceLog[], Error>} returns.useOneTime - Fetch the logs with a single query.
 * @returns {UseInfiniteQueryResult<InstanceLog[], Error>} returns.useContinuous - Fetch the logs with a recursive query with an interval of 5s.
 */
export const useGetInfiniteInstanceLogs = (
  service: string,
  instance: string,
  environment: string,
): GetInstanceLogs => {
  const { createHeaders, handleErrors } = useFetchHelpers();

  const headers = createHeaders(environment);

  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const fetchInstance = async (
    { pageParam },
    selectedVersion,
  ): Promise<LogsResponse> => {
    const initialParameters = selectedVersion
      ? `limit=50&end=${Number(selectedVersion) + 1}`
      : "limit=50";

    const response = await fetch(
      `${baseUrl}/lsm/v1/service_inventory/${service}/${instance}/log?${pageParam ? pageParam : initialParameters}`,
      {
        headers,
      },
    );

    await handleErrors(response, `Failed to fetch logs for: ${instance}`);

    return response.json();
  };

  return {
    useContinuous: (
      selectedVersion: string,
    ): UseInfiniteQueryResult<InstanceLog[], Error> =>
      useInfiniteQuery({
        queryKey: ["get_instance_logs-continuous", service, instance],
        queryFn: (query) => fetchInstance(query, selectedVersion),
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
