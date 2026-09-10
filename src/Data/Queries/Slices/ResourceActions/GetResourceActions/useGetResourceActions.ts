import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { PageSize, Pagination } from "@/Core/Domain";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { useGet, REFETCH_INTERVAL } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";
import { DependencyContext } from "@/UI/Dependency";
import { ResourceAction, ResourceActionFilter } from "@S/ResourceActions/Core/Domain";
import { CursorHandlers, getCursorHandlers } from "./getCursorHandlers";
import { getUrl } from "./getUrl";

/**
 * Parameters required to fetch the environment-wide resource actions.
 */
export interface GetResourceActionsParams {
  filter?: ResourceActionFilter;
  pageSize: PageSize.PageSize;
  currentPage: CurrentPage;
}

/**
 * The raw API response body. The `get_resource_actions` endpoint returns only
 * data and cursor links (no metadata / total count).
 */
interface ResponseBody {
  data: ResourceAction[];
  links: Pagination.Links;
}

/**
 * The response enriched with the cursor-based pagination handlers.
 */
export interface ResourceActionsResponse extends ResponseBody {
  handlers: CursorHandlers;
}

interface GetResourceActions {
  useContinuous: () => UseQueryResult<ResourceActionsResponse, Error>;
}

/**
 * React Query hook to fetch the environment-wide list of resource actions,
 * used by the changelog page.
 *
 * @param {GetResourceActionsParams} params - The query parameters.
 * @returns {GetResourceActions} An object containing the available queries.
 * @returns {UseQueryResult<ResourceActionsResponse, Error>} returns.useContinuous
 *   Fetch the resource actions with a recurrent query with an interval of 5s.
 */
export const useGetResourceActions = (params: GetResourceActionsParams): GetResourceActions => {
  const { filter, pageSize, currentPage } = params;
  const url = getUrl({
    filter,
    pageSize,
    currentPage: currentPage || { kind: "CurrentPage", value: "" },
  });
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<ResponseBody>;
  const filterArray = filter ? Object.values(filter) : [];

  return {
    useContinuous: (): UseQueryResult<ResourceActionsResponse, Error> =>
      useQuery({
        queryKey: getResourceActionsKey.list([pageSize, ...filterArray, currentPage, env]),
        queryFn: () => get(url),
        select: (data) => ({
          ...data,
          handlers: getCursorHandlers(data.links),
        }),
        refetchInterval: (query) => (query.state.error ? false : REFETCH_INTERVAL),
      }),
  };
};

export const getResourceActionsKey = new KeyFactory(SliceKeys.resource, "get_resource_actions");
