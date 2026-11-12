import { InstanceSummary, StateModel, words } from "@inmanta/web-console-core";
import { StateCount, SummaryLabel, summaryLabelSeverity } from "./types";

/**
 * Gets the instance count per lifecycle state of a service, leaving out states without instances.
 * The counts are ordered by `summaryLabelSeverity`, then in lifecycle order. A counted state
 * that is not in the lifecycle is left out, as its label is unknown.
 *
 * @example
 * getStateCounts({ by_state: { up: 2, failed: 1, start: 0 }, ... }, [up (success), failed (danger), start])
 * // [{ stateName: "failed", label: "danger", count: 1, ... }, { stateName: "up", label: "success", count: 2, ... }]
 */
export const getStateCounts = (summary: InstanceSummary, states: StateModel[]): StateCount[] => {
  const stateCounts: StateCount[] = [];

  for (const state of states) {
    const count = Number(summary.by_state[state.name] ?? 0);

    if (count === 0) {
      continue;
    }

    stateCounts.push({
      stateName: state.name,
      stateDisplayName: state.annotations?.web_label || state.name,
      label: state.label ?? "no_label",
      count,
    });
  }

  return stateCounts.sort((a, b) => summaryLabelSeverity[a.label] - summaryLabelSeverity[b.label]);
};

/**
 * Gets the display name of a label.
 */
export const getLabelName = (label: SummaryLabel): string =>
  words(`catalog.summary.label.${label}`);
