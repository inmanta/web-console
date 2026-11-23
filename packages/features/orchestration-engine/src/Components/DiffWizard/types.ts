import { LabelProps } from "@patternfly/react-core";
import { Diff } from "@inmanta/web-console-core";

export interface Item {
  id: string;
  status: Diff.Status;
  entries: EntryInfo[];
}

export interface EntryInfo {
  title: string;
  fromValue: string;
  toValue: string;
}

/**
 * The display text of the two sides of a diff, e.g. "Current state" and "v412".
 */
export interface DiffSideLabels {
  fromLabel: string;
  toLabel: string;
}

/** The order of the status groups in the resource list, changes first. */
export const RESOURCE_LIST_STATUS_ORDER: Diff.Status[] = [
  "modified",
  "added",
  "deleted",
  "agent_down",
  "undefined",
  "skipped_for_undefined",
  "unmodified",
];

/**
 * The color of the label for each diff status: changes in their status color, the statuses the
 * diff couldn't be determined for in blue, unmodified grey.
 */
export const DIFF_STATUS_LABEL_COLORS: Record<Diff.Status, LabelProps["color"]> = {
  modified: "orange",
  added: "green",
  deleted: "red",
  agent_down: "blue",
  undefined: "blue",
  skipped_for_undefined: "blue",
  unmodified: "grey",
};

/**
 * The resources of one status in the resource list, sorted by id.
 */
export interface ResourceListGroup {
  status: Diff.Status;
  items: Item[];
}

/** The URL state key that holds the id of the resource whose diff is shown. */
export const SELECTED_RESOURCE_URL_STATE_KEY = "resource";
