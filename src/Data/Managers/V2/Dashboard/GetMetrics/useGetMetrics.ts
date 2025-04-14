import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { BackendMetricData } from "@/Slices/Dashboard/Core/Domain";
import { CustomError, REFETCH_INTERVAL, useGet } from "../../helpers";
import { getUrl } from "./getUrl";
export interface GetMetricsParams {
  startDate: string;
  endDate: string;
  isLsmAvailable: boolean;
}

/**
 * Return Signature of the useGetMetrics React Query
 */
interface GetMetrics {
  useOneTime: (params: GetMetricsParams) => UseQueryResult<BackendMetricData, CustomError>;
  useContinuous: (params: GetMetricsParams) => UseQueryResult<BackendMetricData, CustomError>;
}

/**
 * React Query hook for fetching metrics.
 *
 * @returns {GetMetrics} An object containing the different available queries.
 * @returns {UseQueryResult<BackendMetricData, CustomError>} returns.useOneTime - Fetch metrics with a single query.
 * @returns {UseQueryResult<BackendMetricData, CustomError>} returns.useContinuous - Fetch metrics with continuous polling.
 */
export const useGetMetrics = (): GetMetrics => {
  const get = useGet()<{ data: BackendMetricData }>;

  return {
    useOneTime: (params: GetMetricsParams): UseQueryResult<BackendMetricData, CustomError> =>
      useQuery({
        queryKey: ["get_metrics-one_time", params],
        queryFn: () => get(getUrl(params)),
        select: (data) => data.data,
      }),

    useContinuous: (params: GetMetricsParams): UseQueryResult<BackendMetricData, CustomError> =>
      useQuery({
        queryKey: ["get_metrics-continuous", params],
        queryFn: () => get(getUrl(params)),
        select: (data) => data.data,
        refetchInterval: REFETCH_INTERVAL,
      }),
  };
};
