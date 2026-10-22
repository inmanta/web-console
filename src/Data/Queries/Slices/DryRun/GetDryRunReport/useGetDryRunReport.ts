import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { DryRunReport } from "@/Core";
import { useGet } from "@/Data/Queries/Helpers";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";
import { DependencyContext } from "@/UI/Dependency";

/**
 * Report interface for the dry run report API response
 */
interface Response {
  data: DryRunReport;
}

/**
 * Return signature of the useGetDryRunReport React Query hook
 */
interface GetDryRunReport {
  useOneTime: (version: string, reportId: string) => UseQueryResult<DryRunReport, Error>;
}

/**
 * React Query hook to fetch Dry Run Report
 *
 * @returns {GetDryRunReport} An object containing the available queries
 * @returns {UseQueryResult<DryRunReport, Error>} returns.useOneTime - Fetch the  dry run report with a single query
 */
export const useGetDryRunReport = (): GetDryRunReport => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<Response>;

  return {
    useOneTime: (version: string, reportId: string): UseQueryResult<DryRunReport, Error> =>
      useQuery({
        queryKey: getDryRunReportKey.single(reportId, [{ version }, env]),
        queryFn: () => get(`/api/v2/dryrun/${version}/${encodeURIComponent(reportId)}`),
        select: (data) => data.data,
      }),
  };
};

export const getDryRunReportKey = new KeyFactory(SliceKeys.dryRun, "get_dry_run_report");
