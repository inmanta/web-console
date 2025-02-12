import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { ServiceModel } from "@/Core";
import { useGet } from "../../helpers";

/**
 * Return Signature of the useGetServiceModel React Query
 */
interface GetServiceModels {
  useOneTime: () => UseQueryResult<ServiceModel[], Error>;
  useContinuous: () => UseQueryResult<ServiceModel[], Error>;
}

/**
 * React Query hook to fetch the service models
 *
 * @param environment {string} - the environment in which the services belongs
 *
 * @returns {GetServiceModels} An object containing the different available queries.
 * @returns {UseQueryResult<ServiceModel[], Error>} returns.useOneTime - Fetch the service models with a single query.
 * @returns {UseQueryResult<ServiceModel[], Error>} returns.useContinuous - Fetch the service models with an interval of 5s.
 */
export const useGetServiceModels = (): GetServiceModels => {
  const get = useGet()<{ data: ServiceModel[] }>;

  return {
    useOneTime: (): UseQueryResult<ServiceModel[], Error> =>
      useQuery({
        queryKey: ["get_service_models-one_time"],
        queryFn: () => get("/lsm/v1/service_catalog?instance_summary=True"),
        retry: false,
        select: (data) => data.data,
      }),
    useContinuous: (): UseQueryResult<ServiceModel[], Error> =>
      useQuery({
        queryKey: ["get_service_models-continuous"],
        queryFn: () => get("/lsm/v1/service_catalog?instance_summary=True"),
        refetchInterval: 5000,
        select: (data) => data.data,
      }),
  };
};
