import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { CompileStatus, Sort, PageSize, Pagination } from "@/Core/Domain";
import { DateRange } from "@/Core/Domain";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { getPaginationHandlers } from "@/Data/Managers/Helpers";
import { CompileReport } from "@/Slices/CompileReports/Core/Domain";
import { DependencyContext } from "@/UI/Dependency";
import { CustomError, REFETCH_INTERVAL, useGet } from "../../helpers";
import { getUrl } from "./getUrl";
import { KeyFactory } from "@/Data/Managers/KeyFactory";

interface Filter {
  requested?: DateRange.DateRange[];
  status?: CompileStatus;
}

export interface CompileReportsParams {
  filter?: Filter;
  sort?: Sort.Sort;
  pageSize: PageSize.PageSize;
  currentPage: CurrentPage;
}

interface ResponseBody {
  data: CompileReport[];
  links: Pagination.Links;
  metadata: Pagination.Metadata;
}

interface HookResponse extends ResponseBody {
  handlers: Pagination.Handlers;
}

interface GetCompileReports {
  useContinuous: () => UseQueryResult<HookResponse, CustomError>;
}

/**
 * React Query hook to fetch compile reports
 *
 * @param params {CompileReportsParams} - Parameters for filtering, sorting and pagination
 *
 * @returns {GetCompileReports} An object containing the different available queries
 * @returns {UseQueryResult<HookResponse, CustomError>} returns.useContinuous - Fetch compile reports with a recursive query with an interval of 5s
 */
export const useGetCompileReports = (params: CompileReportsParams): GetCompileReports => {
  const url = getUrl(params);
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<ResponseBody>;
  const keyFactory = new KeyFactory("compilation", "getCompileReports");

  return {
    useContinuous: (): UseQueryResult<HookResponse, CustomError> =>
      useQuery({
        queryKey: keyFactory.unique(env, [Object.values(params).join(",")]),
        queryFn: () => get(url),
        refetchInterval: REFETCH_INTERVAL,
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
      }),
  };
};
