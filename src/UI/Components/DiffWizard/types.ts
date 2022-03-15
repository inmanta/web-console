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

type TransformResult = "Default" | "File";

export type Transform = (
  title: string,
  entryTitle: string,
  from: string,
  to: string
) => TransformResult;

export type TransformEntry = (
  title: string,
  from: string,
  to: string
) => TransformResult;
