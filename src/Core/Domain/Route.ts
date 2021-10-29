const kinds = [
  "Home",
  "CreateEnvironment",
  "Catalog",
  "Inventory",
  "CreateInstance",
  "EditInstance",
  "History",
  "Diagnose",
  "Events",
  "Resources",
  "CompileReports",
  "CompileDetails",
  "ResourceDetails",
  "Settings",
] as const;

export type RouteKind = typeof kinds[number];

export const isValidKind = (value: string): value is RouteKind =>
  kinds.includes(value as RouteKind);

export interface Route {
  kind: RouteKind;
  parent?: RouteKind;
  path: string;
  label: string;
  clearEnv?: boolean;
}

interface RouteParamsManifest {
  Catalog: undefined;
  Inventory: { service: string };
  CreateInstance: { service: string };
  EditInstance: { service: string; instance: string };
  History: { service: string; instance: string };
  Events: { service: string; instance: string };
  Diagnose: { service: string; instance: string };
  Resources: undefined;
  ResourceHistory: { resourceId: string };
  ResourceLogs: { resourceId: string };
  CompileReports: undefined;
  CompileDetails: { id: string };
  Home: undefined;
  ResourceDetails: { resourceId: string };
  Settings: undefined;
  CreateEnvironment: undefined;
}

export type RouteParams<R extends RouteKind> = RouteParamsManifest[R];
