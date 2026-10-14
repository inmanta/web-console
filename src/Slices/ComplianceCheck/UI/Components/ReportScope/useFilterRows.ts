import { useMemo } from "react";
import { useGetInstancesById } from "@/Data/Queries";
import { DryRun } from "@S/ComplianceCheck/Core/Domain";
import { getFilterRows } from "./helpers";
import { FilterRow } from "./types";

/**
 * The rows of a dry run report's applied filter, with its service instances shown by name once
 * they are looked up. A report on the whole model version has none.
 *
 * @example useFilterRows(report) // [{ key: "serviceEntity", values: [{ value: "l2Connect", kind: "serviceEntity" }] }, ...]
 */
export const useFilterRows = (report: DryRun): FilterRow[] => {
  const resourceFilter = report.resource_filter;
  const instances = useGetInstancesById(resourceFilter?.serviceInstance ?? []);

  return useMemo(
    () => (resourceFilter ? getFilterRows(resourceFilter, Number(report.model), instances) : []),
    [resourceFilter, report.model, instances]
  );
};
