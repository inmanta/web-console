import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { Diff } from "@/Core";
import { ParsedNumber } from "@/Core/Language";
import { useGet, KeyFactory, keySlices } from "@/Data/Queries";
import { DependencyContext } from "@/UI/Dependency";

/**
 * DryRun interface
 */
export interface DryRun extends DryRunProgress {
  id: string;
  environment: string;
  model: ParsedNumber;
  date: string;
}

/**
 * Report interface for the dry run report
 */
export interface Report {
  summary: DryRun;
  diff: Diff.Resource[];
}

/**
 * DryRunProgress interface
 */
export interface DryRunProgress {
  total: ParsedNumber;
  todo: ParsedNumber;
}

/**
 * Report interface for the dry run report API response
 */
interface Response {
  data: Report;
}

/**
 * Return signature of the useGetDryRunReport React Query hook
 */
interface GetDryRunReport {
  useOneTime: (version: string, reportId: string) => UseQueryResult<Report, Error>;
}

/**
 * React Query hook to fetch Dry Run Report
 *
 * @returns {GetDryRunReport} An object containing the available queries
 * @returns {UseQueryResult<Report, Error>} returns.useOneTime - Fetch the  dry run report with a single query
 */
export const useGetDryRunReport = (): GetDryRunReport => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<Response>;
  const keyFactory = new KeyFactory(keySlices.dryRun, "get_dry_run_report");

  return {
    useOneTime: (version: string, reportId: string): UseQueryResult<Report, Error> =>
      useQuery({
        queryKey: keyFactory.single(reportId, [version, env]),
        queryFn: () => get(`/api/v2/dryrun/${version}/${encodeURIComponent(reportId)}`),
        select: (data) => data.data,
      }),
  };
};
