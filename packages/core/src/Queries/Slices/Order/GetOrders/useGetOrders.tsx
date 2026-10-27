import { useContext } from "react";
import { UseQueryResult, keepPreviousData, useQuery } from "@tanstack/react-query";
import { PageSize, Pagination, Sort } from "@inmanta/web-console-core";
import { CurrentPage } from "@inmanta/web-console-core/Common/UrlState/useUrlStateWithCurrentPage";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { ServiceOrder, SortKey } from "@inmanta/web-console-core/Domain/ServiceOrderModel";
import {
  CustomError,
  useGet,
  REFETCH_INTERVAL,
  getPaginationHandlers,
} from "@inmanta/web-console-core/Queries/Helpers";
import { KeyFactory, SliceKeys } from "@inmanta/web-console-core/Queries/Helpers/KeyFactory";
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
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<Result>;

  return {
    useContinuous: (params): UseQueryResult<QueryData, CustomError> =>
      useQuery({
        queryKey: getOrdersKey.list([...Object.values(params), env]),
        queryFn: () => get(getUrl(params)),
        refetchInterval: (query) => (query.state.error ? false : REFETCH_INTERVAL),
        placeholderData: keepPreviousData,
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
      }),
  };
};

export const getOrdersKey = new KeyFactory(SliceKeys.order, "get_order");
