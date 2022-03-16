import { Diff } from "@/Core";

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

export type Refs = React.MutableRefObject<Record<string, HTMLElement>>;

export type Classification = "Default" | "File";
