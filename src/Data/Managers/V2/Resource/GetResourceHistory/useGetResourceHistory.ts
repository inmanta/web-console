import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { PageSize, Pagination } from "@/Core/Domain";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { getPaginationHandlers } from "@/Data/Managers/Helpers/Pagination/getPaginationHandlers";
import { KeyFactory, keySlices } from "@/Data/Managers/KeyFactory";
import { DependencyContext } from "@/UI/Dependency";
import { ResourceHistory } from "@S/ResourceDetails/Core/ResourceHistory";
import { useGet } from "../../helpers";
import { getUrl } from "./getUrl";

/**
 * Interface for parameters required to fetch resource history
 */
export interface GetResourceHistoryParams {
  id: string;
  pageSize: PageSize.PageSize;
  currentPage: CurrentPage;
  sort?: {
    name: string;
    order: "asc" | "desc";
  };
}

/**
 * Interface for the raw API response body containing history data and pagination info
 */
interface ResponseBody {
  data: ResourceHistory[];
  links: Pagination.Links;
  metadata: Pagination.Metadata;
}

/**
 * Extended interface that includes pagination handlers for the history response
 */
export interface ResourceHistoryResponse extends ResponseBody {
  handlers: Pagination.Handlers;
}

/**
 * Return signature of the useGetResourceHistory React Query hook
 */
interface GetResourceHistory {
  useOneTime: () => UseQueryResult<ResourceHistoryResponse, Error>;
}

/**
 * React Query hook to fetch history for a specific resource
 *
 * @returns {GetResourceHistory} An object containing the available queries
 * @returns {UseQueryResult<ResourceHistoryResponse, Error>} returns.useOneTime - Fetch the resource history with a single query
 */
export const useGetResourceHistory = (params: GetResourceHistoryParams): GetResourceHistory => {
  const { id, pageSize, sort, currentPage } = params;
  const url = getUrl({
    id,
    pageSize,
    sort,
    currentPage: currentPage || { kind: "CurrentPage", value: "" },
  });
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<ResponseBody>;
  const keyFactory = new KeyFactory(keySlices.resource, "get_resource_history");
  const sortArray = sort ? [sort.name, sort.order] : [];

  return {
    useOneTime: (): UseQueryResult<ResourceHistoryResponse, Error> =>
      useQuery({
        queryKey: keyFactory.list([id, pageSize.value, ...sortArray, currentPage.value, env]),
        queryFn: () => get(url),
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
      }),
  };
};
