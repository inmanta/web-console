import { useMemo } from "react";
import { DryRun } from "@/Core";
import { createFilterRows, getReportInstanceLabels } from "./helpers";
import { FilterRow } from "./types";

/**
 * The rows of a dry run report's applied filter, with its service instances shown by the labels
 * stored with the report. A report on the whole model version has none.
 *
 * @example useFilterRows(report) // [{ key: "serviceInstance", values: [{ value: "cpe-1", kind: "serviceInstance" }] }]
 */
export const useFilterRows = (report: DryRun): FilterRow[] =>
  useMemo(
    () =>
      report.resource_filter
        ? createFilterRows(report.resource_filter, getReportInstanceLabels(report))
        : [],
    [report]
  );
