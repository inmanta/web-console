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

/**
 * Every status, in the order of the status groups in the resource list, changes first. A record,
 * so a new status doesn't compile until it has a place here.
 */
const RESOURCE_LIST_STATUSES: Record<Diff.Status, true> = {
  modified: true,
  added: true,
  deleted: true,
  agent_down: true,
  undefined: true,
  skipped_for_undefined: true,
  unmodified: true,
};

/** The order of the status groups in the resource list, changes first. */
export const RESOURCE_LIST_STATUS_ORDER = Object.keys(RESOURCE_LIST_STATUSES) as Diff.Status[];

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
 * The resources of one status in the resource list.
 */
export interface ResourceListGroup {
  status: Diff.Status;

  /** The index of the group's first resource among all resources of the list. */
  startIndex: number;
  items: Item[];
}

/** The URL state key that holds the id of the resource whose diff is shown. */
export const SELECTED_RESOURCE_URL_STATE_KEY = "resource";

/**
 * The filters on the resources of a diff, kept in the URL. A resource shows when its status is
 * ticked and its id matches every other filter that has values.
 */
export interface DiffFilter {
  /** The statuses to show. Unset shows the default statuses, everything but unmodified. */
  status?: Diff.Status[];

  /** Parts of the resource type, any of which the type of a resource must contain. */
  type?: string[];

  /** Parts of the agent name, any of which the agent of a resource must contain. */
  agent?: string[];

  /** Parts of the id value, any of which the id value of a resource must contain. */
  value?: string[];

  /** Set once the statuses were changed, so an unset status means none are ticked. */
  disregardDefault?: boolean;
}

/** How the filter fields that aren't string lists are stored in the URL. */
export const DIFF_FILTER_URL_KEYS: Record<string, "Boolean"> = { disregardDefault: "Boolean" };

/** The resource id filters of the filter drawer, matched against the parsed resource id. */
export const DIFF_FILTER_ID_KEYS = ["type", "agent", "value"] as const;

export type DiffFilterIdKey = (typeof DIFF_FILTER_ID_KEYS)[number];

/**
 * The parts of a resource id that the resource id filters match, one per DiffFilterIdKey.
 */
export interface ResourceIdParts {
  /** The resource type, e.g. "std::File", or null when the id doesn't parse. */
  type: string | null;

  /** The agent name, or null when the id doesn't parse. */
  agent: string | null;

  /** The attribute value, like the path of a file, or the whole id when it doesn't parse. */
  value: string;
}
