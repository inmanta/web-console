import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { CustomError, useGet } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";
import { BackendMetricData } from "@/Slices/Dashboard/Core/Domain";
import { DependencyContext } from "@/UI/Dependency";
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
}

/**
 * React Query hook for fetching metrics.
 *
 * @returns {GetMetrics} An object containing the different available queries.
 * @returns {UseQueryResult<BackendMetricData, CustomError>} returns.useOneTime - Fetch metrics with a single query.
 */
export const useGetMetrics = (): GetMetrics => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<{ data: BackendMetricData }>;

  return {
    useOneTime: (params: GetMetricsParams): UseQueryResult<BackendMetricData, CustomError> =>
      useQuery({
        queryKey: getMetricsKey.list([...Object.values(params), env]),
        queryFn: () => get(getUrl(params)),
        select: (data) => data.data,
      }),
  };
};

export const getMetricsKey = new KeyFactory(SliceKeys.dashboard, "get_metrics");
