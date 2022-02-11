import { Diff } from "@/Core";

export interface DiffItem {
  id: string;
  status: Diff.Status;
  entries: DiffEntry[];
}

export interface DiffEntry {
  title: string;
  fromValue: string;
  toValue: string;
}

export type Refs = React.MutableRefObject<Record<string, HTMLElement>>;
