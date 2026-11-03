import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { ServiceModel } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { CustomError, useGet, REFETCH_INTERVAL } from "@inmanta/web-console-core/Queries/Helpers";
import { getServiceModelKey } from "../GetServiceModel";

/**
 * Options for the useOneTime query.
 */
interface UseOneTimeOptions {
  /**
   * Whether the query is allowed to run. Defaults to true.
   */
  enabled?: boolean;
}

/**
 * Return Signature of the useGetServiceModel React Query
 */
interface GetServiceModels {
  useOneTime: (options?: UseOneTimeOptions) => UseQueryResult<ServiceModel[], CustomError>;
  useContinuous: () => UseQueryResult<ServiceModel[], CustomError>;
  useContinuousNoRefetch: () => UseQueryResult<ServiceModel[], CustomError>;
}

/**
 * React Query hook to fetch the service models
 *
 * @param environment {string} - the environment in which the services belongs
 *
 * @returns {GetServiceModels} An object containing the different available queries.
 * @returns {UseQueryResult<ServiceModel[], CustomError>} returns.useOneTime - Fetch the service models once, or not at all when `enabled` is false.
 * @returns {UseQueryResult<ServiceModel[], CustomError>} returns.useContinuous - Fetch the service models with an interval of 5s.
 */
export const useGetServiceModels = (): GetServiceModels => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<{ data: ServiceModel[] }>;

  return {
    useOneTime: (options?: UseOneTimeOptions): UseQueryResult<ServiceModel[], CustomError> =>
      useQuery({
        queryKey: getServiceModelKey.list([env]),
        queryFn: () => get("/lsm/v1/service_catalog?instance_summary=True"),
        refetchOnWindowFocus: false,
        enabled: options?.enabled ?? true,
        select: (data) => data.data,
      }),
    useContinuous: (): UseQueryResult<ServiceModel[], CustomError> =>
      useQuery({
        queryKey: getServiceModelKey.list([env]),
        queryFn: () => get("/lsm/v1/service_catalog?instance_summary=True"),
        refetchInterval: (query) => (query.state.error ? false : REFETCH_INTERVAL),
        select: (data) => data.data,
      }),
    useContinuousNoRefetch: (): UseQueryResult<ServiceModel[], CustomError> =>
      useQuery({
        queryKey: getServiceModelKey.list([env]),
        queryFn: () => get("/lsm/v1/service_catalog?instance_summary=True"),
        refetchInterval: (query) => (query.state.error ? false : REFETCH_INTERVAL),
        refetchOnWindowFocus: false,
        select: (data) => data.data,
      }),
  };
};
