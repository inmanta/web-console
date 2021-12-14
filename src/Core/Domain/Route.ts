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
  "Agents",
  "AgentProcess",
  "CompileReports",
  "CompileDetails",
  "ResourceDetails",
  "Settings",
  "Status",
  "DesiredState",
] as const;

export type RouteKind = typeof kinds[number];

export const isValidKind = (value: string): value is RouteKind =>
  kinds.includes(value as RouteKind);

export interface Route {
  kind: RouteKind;
  parent?: RouteKind;
  path: string;
  label: string;
  environmentRole: "Forbidden" | "Optional" | "Required";
}

interface RouteParamKeysManifest {
  Inventory: "service";
  CreateInstance: "service";
  EditInstance: "service" | "instance";
  History: "service" | "instance";
  Events: "service" | "instance";
  Diagnose: "service" | "instance";
  ResourceHistory: "resourceId";
  ResourceLogs: "resourceId";
  CompileDetails: "id";
  ResourceDetails: "resourceId";
  AgentProcess: "id";
}

export type RouteParamKeys<K extends RouteKind> =
  K extends keyof RouteParamKeysManifest ? RouteParamKeysManifest[K] : never;

export type RouteParams<K extends RouteKind> =
  K extends keyof RouteParamKeysManifest
    ? Record<RouteParamKeysManifest[K], string>
    : undefined;

export interface RouteMatch {
  route: Route;
  params: RouteParams<RouteKind>;
}
