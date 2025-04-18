import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { PageSize, Pagination, Sort } from "@/Core";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { getPaginationHandlers } from "@/Data/Managers/Helpers";
import { ServiceOrder, SortKey } from "@/Slices/Orders/Core/Query";
import { CustomError, useGet, REFETCH_INTERVAL } from "../../helpers";
import { getUrl } from "./getUrl";

/**
 * Result interface for the orders API response
 */
interface Result {
  data: ServiceOrder[];
  links: Pagination.Links;
  metadata: Pagination.Metadata;
}

/**
 * Extended interface that includes pagination handlers for the orders response
 */
interface QueryData extends Result {
  handlers: Pagination.Handlers;
}

/**
 * Interface for parameters required to fetch orders
 */
export interface OrdersQueryParams {
  sort?: Sort.Sort<SortKey>;
  pageSize: PageSize.PageSize;
  currentPage: CurrentPage;
}

/**
 * Return Signature of the useGetOrders React Query
 */
interface GetOrders {
  useContinuous: (params: OrdersQueryParams) => UseQueryResult<QueryData, CustomError>;
}

/**
 * React Query hook to fetch the orders
 *
 * @returns {GetOrders} An object containing the different available queries.
 * @returns {UseQueryResult<QueryData, CustomError>} returns.useContinuous - Fetch the orders with an interval of 5s.
 */
export const useGetOrders = (): GetOrders => {
  const get = useGet()<Result>;

  return {
    useContinuous: (params): UseQueryResult<QueryData, CustomError> =>
      useQuery({
        queryKey: ["get_orders-continuous", ...Array.from(Object.values(params))],
        queryFn: () => get(getUrl(params)),
        refetchInterval: REFETCH_INTERVAL,
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
      }),
  };
};
