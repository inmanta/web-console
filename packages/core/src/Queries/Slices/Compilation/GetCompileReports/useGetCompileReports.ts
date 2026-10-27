import { useContext } from "react";
import { UseQueryResult, keepPreviousData, useQuery } from "@tanstack/react-query";
import { CurrentPage } from "@inmanta/web-console-core/Common/UrlState/useUrlStateWithCurrentPage";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { CompileStatus, Sort, PageSize, Pagination } from "@inmanta/web-console-core/Domain";
import { DateRange } from "@inmanta/web-console-core/Domain";
import { CompileReport } from "@inmanta/web-console-core/Domain/CompileReport";
import {
  CustomError,
  REFETCH_INTERVAL,
  useGet,
  getPaginationHandlers,
} from "@inmanta/web-console-core/Queries/Helpers";
import { KeyFactory, SliceKeys } from "@inmanta/web-console-core/Queries/Helpers/KeyFactory";
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

  return {
    useContinuous: (): UseQueryResult<HookResponse, CustomError> =>
      useQuery({
        queryKey: getCompileReportsKey.list([env, ...Object.values(params)]),
        queryFn: () => get(url),
        placeholderData: keepPreviousData,
        refetchInterval: (query) => (query.state.error ? false : REFETCH_INTERVAL),
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
      }),
  };
};

export const getCompileReportsKey = new KeyFactory(SliceKeys.compilation, "get_compile_report");
