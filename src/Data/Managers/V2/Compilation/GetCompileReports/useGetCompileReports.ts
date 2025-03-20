import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { CompileStatus, Sort, PageSize, Pagination } from "@/Core/Domain";
import { DateRange } from "@/Core/Domain";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { getPaginationHandlers } from "@/Data/Managers/Helpers";
import { CompileReport } from "@/Slices/CompileReports/Core/Domain";
import { useGet } from "../../helpers";
import { getUrl } from "./getUrl";

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
  useOneTime: () => UseQueryResult<HookResponse, Error>;
  useContinuous: () => UseQueryResult<HookResponse, Error>;
}

/**
 * React Query hook to fetch compile reports
 *
 * @param params {CompileReportsParams} - Parameters for filtering, sorting and pagination
 *
 * @returns {GetCompileReports} An object containing the different available queries
 * @returns {UseQueryResult<HookResponse, Error>} returns.useOneTime - Fetch compile reports with a single query
 * @returns {UseQueryResult<HookResponse, Error>} returns.useContinuous - Fetch compile reports with a recursive query with an interval of 5s
 */
export const useGetCompileReports = (
  params: CompileReportsParams,
): GetCompileReports => {
  const url = getUrl(params);
  const get = useGet()<ResponseBody>;

  return {
    useOneTime: (): UseQueryResult<HookResponse, Error> =>
      useQuery({
        queryKey: [
          "get_compile_reports-one_time",
          params.filter,
          params.sort,
          params.pageSize,
          params.currentPage,
        ],
        queryFn: () => get(url),
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
      }),
    useContinuous: (): UseQueryResult<HookResponse, Error> =>
      useQuery({
        queryKey: [
          "get_compile_reports-continuous",
          params.filter,
          params.sort,
          params.pageSize,
          params.currentPage,
        ],
        queryFn: () => get(url),
        refetchInterval: 5000,
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
      }),
  };
};
