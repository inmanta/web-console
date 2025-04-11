import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { ServiceOrder } from "@/Slices/Orders/Core/Query";
import { CustomError, useGet, REFETCH_INTERVAL } from "../../helpers";

/**
 * Result interface for the resources API response
 */
interface Result {
  data: ServiceOrder;
}

/**
 * Return Signature of the useGetServiceModel React Query
 */
interface GetServiceModels {
  useContinuous: (id: string) => UseQueryResult<ServiceOrder, CustomError>;
}

/**
 * React Query hook to fetch the service models
 *
 * @param environment {string} - the environment in which the services belongs
 *
 * @returns {GetServiceModels} An object containing the different available queries.
 * @returns {UseQueryResult<QueryData, CustomError>} returns.useOneTime - Fetch the service models with a single query.
 * @returns {UseQueryResult<QueryData, CustomError>} returns.useContinuous - Fetch the service models with an interval of 5s.
 */
export const useGetOrderDetails = (): GetServiceModels => {
  const get = useGet()<Result>;

  return {
    useContinuous: (id): UseQueryResult<ServiceOrder, CustomError> =>
      useQuery({
        queryKey: ["get_service_models-continuous", id],
        queryFn: () => get(`/lsm/v2/order/${id}`),
        refetchInterval: REFETCH_INTERVAL,
        select: (data) => data.data,
      }),
  };
};
