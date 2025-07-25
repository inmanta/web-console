import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { ServiceModel } from "@/Core";
import { CustomError, useGet, REFETCH_INTERVAL } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";
import { DependencyContext } from "@/UI/Dependency";

/**
 * Return Signature of the useGetServiceModel React Query
 */
interface GetServiceModel {
  useOneTime: () => UseQueryResult<ServiceModel, CustomError>;
  useContinuous: () => UseQueryResult<ServiceModel, CustomError>;
}

/**
 * React Query hook to fetch the service model
 *
 * @param service {string} - the service entity
 *
 * @returns {GetServiceModel} An object containing the different available queries.
 * @returns {UseQueryResult<ServiceModel, CustomError>} returns.useOneTime - Fetch the service model with a single query.
 * @returns {UseQueryResult<ServiceModel, CustomError>} returns.useContinuous - Fetch the service model with a recursive query with an interval of 5s.
 */
export const useGetServiceModel = (service: string): GetServiceModel => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<{ data: ServiceModel }>;

  return {
    useOneTime: (): UseQueryResult<ServiceModel, CustomError> =>
      useQuery({
        queryKey: getServiceModelKey.single(service, [env]),
        queryFn: () => get(`/lsm/v1/service_catalog/${service}?instance_summary=True`),
        select: (data) => data.data,
      }),
    useContinuous: (): UseQueryResult<ServiceModel, CustomError> =>
      useQuery({
        queryKey: getServiceModelKey.single(service, [env]),
        queryFn: () => get(`/lsm/v1/service_catalog/${service}?instance_summary=True`),
        refetchInterval: REFETCH_INTERVAL,
        select: (data) => data.data,
      }),
  };
};

export const getServiceModelKey = new KeyFactory(SliceKeys.service, "get_service_model");
