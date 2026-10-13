import { useGetInstancesById } from "@/Data/Queries";
import { DryRun } from "@S/ComplianceCheck/Core/Domain";
import { ScopeRow, getScopeRows } from "./helpers";

/**
 * The rows of a dry run report's applied filter, with its service instances shown by name once
 * they are looked up. A report on the whole model version has none.
 *
 * @example useScopeRows(report) // [{ key: "serviceEntity", values: [{ value: "l2Connect", kind: "serviceEntity" }] }, ...]
 */
export const useScopeRows = (report: DryRun): ScopeRow[] => {
  const resourceFilter = report.resource_filter;
  const instances = useGetInstancesById(resourceFilter?.serviceInstance ?? []);

  return resourceFilter ? getScopeRows(resourceFilter, Number(report.model), instances) : [];
};
