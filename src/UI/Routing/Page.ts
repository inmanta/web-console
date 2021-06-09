import { ComponentType } from "react";

export type Kinds =
  | "Catalog"
  | "Inventory"
  | "CreateInstance"
  | "History"
  | "Diagnose"
  | "Events";

interface PageParamsManifest {
  Catalog: undefined;
  Inventory: { service: string };
  CreateInstance: { service: string };
  History: { service: string; instance: string };
  Events: { service: string; instance: string };
  Diagnose: { service: string; instance: string };
}

export type PageParams<Page extends Kinds> = PageParamsManifest[Page];

export interface Page {
  kind: Kinds;
  parent?: Kinds;
  path: string;
  label: string;
  component: ComponentType;
}
