import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { BackendMetricData } from "@/Slices/Dashboard/Core/Domain";
import { useGet } from "../../helpers";

interface GetMetricsParams {
  startDate: string;
  endDate: string;
  isLsmAvailable: boolean;
}

/**
 * Return Signature of the useGetMetrics React Query
 */
interface GetMetrics {
  useOneTime: (
    params: GetMetricsParams,
  ) => UseQueryResult<BackendMetricData, Error>;
  useContinuous: (
    params: GetMetricsParams,
  ) => UseQueryResult<BackendMetricData, Error>;
}

/**
 * React Query hook for fetching metrics.
 *
 * @returns {GetMetrics} An object containing the different available queries.
 * @returns {UseQueryResult<BackendMetricData, Error>} returns.useOneTime - Fetch metrics with a single query.
 * @returns {UseQueryResult<BackendMetricData, Error>} returns.useContinuous - Fetch metrics with continuous polling.
 */
export const useGetMetrics = (): GetMetrics => {
  const get = useGet()<{ data: BackendMetricData }>;

  const buildUrl = (params: GetMetricsParams) => {
    const lsmMetrics =
      "metrics=lsm.service_count&metrics=lsm.service_instance_count&";

    return `/api/v2/metrics?${
      params.isLsmAvailable ? lsmMetrics : ""
    }metrics=orchestrator.compile_time&metrics=orchestrator.compile_waiting_time&metrics=orchestrator.compile_rate&metrics=resource.agent_count&metrics=resource.resource_count&start_interval=${params.startDate}&end_interval=${params.endDate}&nb_datapoints=15&round_timestamps=true`;
  };

  return {
    useOneTime: (
      params: GetMetricsParams,
    ): UseQueryResult<BackendMetricData, Error> =>
      useQuery({
        queryKey: ["get_metrics-one_time", params],
        queryFn: () => get(buildUrl(params)),
        retry: false,
        select: (data) => data.data,
      }),

    useContinuous: (
      params: GetMetricsParams,
    ): UseQueryResult<BackendMetricData, Error> =>
      useQuery({
        queryKey: ["get_metrics-continuous", params],
        queryFn: () => get(buildUrl(params)),
        retry: false,
        select: (data) => data.data,
        refetchInterval: 5000,
      }),
  };
};
