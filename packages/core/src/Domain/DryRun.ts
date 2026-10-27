import { ParsedNumber } from "@inmanta/web-console-core/Language";
import { Diff } from "./Diff";
import { ResourceActionFilter } from "./ResourceActionFilter";

/**
 * The free-form context a client attaches when it starts a dry run through dryrun_filtered. Any API
 * client can store anything in it, so its values are unknown until checked. The web-console sets
 * web_instance_labels: the label of each service instance its resource filter names, keyed by
 * instance id.
 */
export type DryRunContext = Record<string, unknown>;

/**
 * A dry run of one model version. resource_filter and context are what it was started with
 * through dryrun_filtered: resource_filter is null when it ran on the whole model version, and
 * context is null when it was started without one. Servers from before dry run contexts leave
 * context out.
 */
export interface DryRun extends DryRunProgress {
  id: string;
  environment: string;
  model: ParsedNumber;
  date: string;
  resource_filter: ResourceActionFilter | null;
  context?: DryRunContext | null;
}

/**
 * A dry run report: the dry run itself and the diff of each resource it covered.
 */
export interface DryRunReport {
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
