import React from "react";
import { Label } from "@patternfly/react-core";
import { DryRun } from "@/Core";
import { createStatusValues, formatScopeLabel, isFiltered } from "./helpers";
import { useFilterRows } from "./useFilterRows";

/**
 * The most characters a scope label shows before it is truncated: enough for the design's longest
 * summary, "l2Connect › demo-cpe-ring +4" (28 characters). PatternFly shows the whole label on
 * hover when it is cut off.
 */
const SCOPE_LABEL_MAX_WIDTH = "28ch";

interface Props {
  report: DryRun;
}

/**
 * A short summary of what a dry run report covered, to tell reports of the same version apart in
 * the report picker. A filtered dry run gets a purple label; one on the whole model version,
 * including one whose filter only picks the version, gets an outline label.
 *
 * @props {Props} props - The props of the component
 *  @prop {DryRun} report - The dry run report
 *
 * @returns {React.FC<Props>} The scope label
 */
export const ScopeLabel: React.FC<Props> = ({ report }) => {
  const rows = useFilterRows(report);
  const statusValues = report.resource_filter ? createStatusValues(report.resource_filter) : [];

  return (
    <Label
      isCompact
      textMaxWidth={SCOPE_LABEL_MAX_WIDTH}
      {...(isFiltered(rows, statusValues) ? { color: "purple" } : { variant: "outline" })}
    >
      {formatScopeLabel(rows, statusValues)}
    </Label>
  );
};
