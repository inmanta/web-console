import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { Diff } from "@/Core";
import { ParsedNumber } from "@/Core/Language";
import { useGet } from "../../helpers";

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
 * React Query hook to fetch details of a specific resource
 *
 * @returns {GetDryRunReport} An object containing the available queries
 * @returns {UseQueryResult<Report, Error>} returns.useOneTime - Fetch the resource details with a single query
 */
export const useGetDryRunReport = (): GetDryRunReport => {
  const get = useGet()<Response>;

  return {
    useOneTime: (version: string, reportId: string): UseQueryResult<Report, Error> =>
      useQuery({
        queryKey: ["get_dry_run_reports-one_time", version, reportId],
        queryFn: () => get(`/api/v2/dryrun/${version}/${encodeURIComponent(reportId)}`),
        select: (data) => data.data,
      }),
  };
};
