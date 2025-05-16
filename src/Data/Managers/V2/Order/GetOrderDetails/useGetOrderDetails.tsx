import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { ServiceOrder } from "@/Slices/Orders/Core/Query";
import { DependencyContext } from "@/UI/Dependency";
import { CustomError, useGet, REFETCH_INTERVAL } from "../../helpers";

/**
 * Result interface for the order details API response
 */
interface Result {
  data: ServiceOrder;
}

/**
 * Return Signature of the useGetOrderDetails React Query
 */
interface GetOrderDetails {
  useContinuous: (id: string) => UseQueryResult<ServiceOrder, CustomError>;
}

/**
 * React Query hook to fetch the order details
 *
 * @returns {GetOrderDetails} An object containing the different available queries.
 * @returns {UseQueryResult<QueryData, CustomError>} returns.useContinuous - Fetch the order details with an interval of 5s.
 */
export const useGetOrderDetails = (): GetOrderDetails => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<Result>;

  return {
    useContinuous: (id): UseQueryResult<ServiceOrder, CustomError> =>
      useQuery({
        queryKey: ["get_order_details-continuous", id, env],
        queryFn: () => get(`/lsm/v2/order/${id}`),
        refetchInterval: REFETCH_INTERVAL,
        select: (data) => data.data,
      }),
  };
};
