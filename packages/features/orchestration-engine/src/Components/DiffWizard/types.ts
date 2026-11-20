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

export type Refs = React.MutableRefObject<Record<string, HTMLElement>>;
