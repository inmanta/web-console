import { LabelProps } from "@patternfly/react-core";
import { InstancesByLabel } from "@inmanta/web-console-core";

/**
 * A lifecycle state label that instances can be counted by.
 */
export type SummaryLabel = keyof InstancesByLabel;

/**
 * The severity rank of each summary label, 1 being the most severe. Every label needs a rank, so a
 * new label in `InstancesByLabel` fails to compile until it gets one here.
 */
export const summaryLabelSeverity: Record<SummaryLabel, number> = {
  danger: 1,
  warning: 2,
  info: 3,
  success: 4,
  no_label: 5,
};

const isSummaryLabel = (key: string): key is SummaryLabel => key in summaryLabelSeverity;

/**
 * The summary labels in display order, most severe first.
 */
export const summaryLabels: SummaryLabel[] = Object.keys(summaryLabelSeverity)
  .filter(isSummaryLabel)
  .sort((a, b) => summaryLabelSeverity[a] - summaryLabelSeverity[b]);

/**
 * The PatternFly `Label` color of each summary label. Info is blue like the other info labels in
 * the app, not PatternFly's purple info status, and "no_label" has no color, so it stays grey.
 */
export const summaryLabelColors: Record<SummaryLabel, Pick<LabelProps, "status" | "color">> = {
  danger: { status: "danger" },
  warning: { status: "warning" },
  info: { color: "blue" },
  success: { status: "success" },
  no_label: {},
};

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
