import { ResourceActionFilter } from "@/Core/Domain";
import { Diff } from "@/Core/Domain/Diff";
import { ParsedNumber } from "@/Core/Language";

/**
 * A dry run of one model version. resource_filter is the filter it was started with through
 * dryrun_filtered, or null when it ran on the whole model version.
 */
export interface DryRun extends DryRunProgress {
  id: string;
  environment: string;
  model: ParsedNumber;
  date: string;
  resource_filter: ResourceActionFilter | null;
}

/**
 * A dry run report: the dry run itself and the diff of each resource it covered.
 */
export interface Report {
  summary: DryRun;
  diff: Diff.Resource[];
}

/**
 * How far a dry run got: the number of resources it covers and how many are still to do.
 */
export interface DryRunProgress {
  total: ParsedNumber;
  todo: ParsedNumber;
}
