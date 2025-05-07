import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { ServiceModel } from "@/Core";
import { CustomError, useGet, REFETCH_INTERVAL } from "../../helpers";

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
  const get = useGet()<{ data: ServiceModel[] }>;

  return {
    useContinuous: (): UseQueryResult<ServiceModel[], CustomError> =>
      useQuery({
        queryKey: ["get_service_models-continuous"],
        queryFn: () => get("/lsm/v1/service_catalog?instance_summary=True"),
        refetchInterval: REFETCH_INTERVAL,
        select: (data) => data.data,
      }),
  };
};
