import { useMemo } from "react";
import { DryRun } from "@S/ComplianceCheck/Core/Domain";
import { getFilterRows } from "./helpers";
import { FilterRow, InstancesById } from "./types";

/**
 * The rows of a dry run report's applied filter, with its service instances shown by name once
 * they are looked up. A report on the whole model version has none.
 *
 * @example useFilterRows(report, instances) // [{ key: "serviceEntity", values: [{ value: "l2Connect", kind: "serviceEntity" }] }, ...]
 */
export const useFilterRows = (report: DryRun, instances: InstancesById): FilterRow[] => {
  const resourceFilter = report.resource_filter;

  return useMemo(
    () => (resourceFilter ? getFilterRows(resourceFilter, Number(report.model), instances) : []),
    [resourceFilter, report.model, instances]
  );
};
