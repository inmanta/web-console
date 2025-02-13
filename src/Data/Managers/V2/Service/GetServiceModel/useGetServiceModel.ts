import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { ServiceModel } from "@/Core";
import { useGet } from "../../helpers";

/**
 * Return Signature of the useGetServiceModel React Query
 */
interface GetServiceModel {
  useOneTime: () => UseQueryResult<ServiceModel, Error>;
  useContinuous: () => UseQueryResult<ServiceModel, Error>;
}

/**
 * React Query hook to fetch the service model
 *
 * @param service {string} - the service entity
 *
 * @returns {GetServiceModel} An object containing the different available queries.
 * @returns {UseQueryResult<ServiceModel, Error>} returns.useOneTime - Fetch the service model with a single query.
 * @returns {UseQueryResult<ServiceModel, Error>} returns.useContinuous - Fetch the service model with a recursive query with an interval of 5s.
 */
export const useGetServiceModel = (service: string): GetServiceModel => {
  const get = useGet()<{ data: ServiceModel }>;

  return {
    useOneTime: (): UseQueryResult<ServiceModel, Error> =>
      useQuery({
        queryKey: ["get_service_model-one_time", service],
        queryFn: () =>
          get(`/lsm/v1/service_catalog/${service}?instance_summary=True`),
        retry: false,
        select: (data) => data.data,
      }),
    useContinuous: (): UseQueryResult<ServiceModel, Error> =>
      useQuery({
        queryKey: ["get_service_model-continuous", service],
        queryFn: () =>
          get(`/lsm/v1/service_catalog/${service}?instance_summary=True`),
        refetchInterval: 5000,
        select: (data) => data.data,
      }),
  };
};
