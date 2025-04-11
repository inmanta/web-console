import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { PageSize, Pagination, Sort } from "@/Core";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { getPaginationHandlers } from "@/Data/Managers/Helpers";
import { ServiceOrder, SortKey } from "@/Slices/Orders/Core/Query";
import { CustomError, useGet, REFETCH_INTERVAL } from "../../helpers";
import { getUrl } from "./getUrl";

/**
 * Result interface for the resources API response
 */
interface Result {
  data: ServiceOrder[];
  links: Pagination.Links;
  metadata: Pagination.Metadata;
}

interface QueryData extends Result {
  handlers: Pagination.Handlers;
}

export interface OrdersQueryParams {
  sort?: Sort.Sort<SortKey>;
  pageSize: PageSize.PageSize;
  currentPage: CurrentPage;
}

/**
 * Return Signature of the useGetServiceModel React Query
 */
interface GetServiceModels {
  useContinuous: (params: OrdersQueryParams) => UseQueryResult<QueryData, CustomError>;
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
export const useGetOrders = (): GetServiceModels => {
  const get = useGet()<Result>;

  return {
    useContinuous: (params): UseQueryResult<QueryData, CustomError> =>
      useQuery({
        queryKey: ["get_service_models-continuous", ...Array.from(Object.values(params))],
        queryFn: () => get(getUrl(params)),
        refetchInterval: REFETCH_INTERVAL,
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
      }),
  };
};
