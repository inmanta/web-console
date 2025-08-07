import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { ServiceModel } from "@/Core";
import { CustomError, useGet, REFETCH_INTERVAL } from "@/Data/Queries";
import { DependencyContext } from "@/UI/Dependency";
import { getServiceModelKey } from "../GetServiceModel";

/**
 * Return Signature of the useGetServiceModel React Query
 */
interface GetServiceModels {
  useContinuous: () => UseQueryResult<ServiceModel[], CustomError>;
}

/**
 * React Query hook to fetch the service models
 *
 * @param environment {string} - the environment in which the services belongs
 *
 * @returns {GetServiceModels} An object containing the different available queries.
 * @returns {UseQueryResult<ServiceModel[], CustomError>} returns.useContinuous - Fetch the service models with an interval of 5s.
 */
export const useGetServiceModels = (): GetServiceModels => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<{ data: ServiceModel[] }>;

  return {
    useContinuous: (): UseQueryResult<ServiceModel[], CustomError> =>
      useQuery({
        queryKey: getServiceModelKey.list([env]),
        queryFn: () => get("/lsm/v1/service_catalog?instance_summary=True"),
        refetchInterval: (query) => query.state.error ? false : REFETCH_INTERVAL,
        select: (data) => data.data,
      }),
  };
};
