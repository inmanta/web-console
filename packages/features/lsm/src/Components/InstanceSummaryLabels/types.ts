import { InstancesByLabel } from "@inmanta/web-console-core";

/**
 * A lifecycle state label that instances can be counted by.
 */
export type SummaryLabel = keyof InstancesByLabel;

/**
 * The summary labels in display order, most severe first.
 */
export const summaryLabels: SummaryLabel[] = ["danger", "warning", "info", "success", "no_label"];

/**
 * Turns the labels into filter toggles. `activeLabel` is the label whose filter is on, or null
 * when none is.
 */
export interface LabelFiltering {
  activeLabel: SummaryLabel | null;
  onToggle: (label: SummaryLabel) => void;
}

/**
 * The number of instances of a service in one lifecycle state.
 */
export interface StateCount {
  /** The state name, as used in `instance_summary.by_state`. */
  stateName: string;

  /** The state's `web_label`, or its name when it has none. */
  stateDisplayName: string;

  /** The state's label, or "no_label" when it has none. */
  label: SummaryLabel;
  count: number;
}

/**
 * A row in the tooltip of a status label: what is counted and how many instances.
 */
export interface StateCountsTooltipRow {
  /** A unique key for the row, built from names rather than display text. */
  key: string;

  /** The text shown for the row, such as the state's display name. */
  displayName: string;
  count: number;
}
