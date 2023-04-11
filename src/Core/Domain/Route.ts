const kinds = [
  /**
   * Main
   */
  "Home",
  "CreateEnvironment",
  "Settings",
  "Status",
  "NotificationCenter",

  /**
   * LSM
   */
  "Dashboard",
  "Catalog",
  "Inventory",
  "ServiceDetails",
  "CreateInstance",
  "EditInstance",
  "History",
  "Diagnose",
  "Events",
  "InstanceComposer",
  "InstanceComposerEditor",

  /**
   * Resource Manager
   */
  "Resources",
  "Agents",
  "Facts",
  "AgentProcess",
  "ResourceDetails",

  /**
   * Orchestration Engine
   */
  "CompileReports",
  "CompileDetails",
  "DesiredState",
  "DesiredStateDetails",
  "DesiredStateResourceDetails",
  "DesiredStateCompare",
  "Parameters",
  "ComplianceCheck",
] as const;

export type RouteKind = (typeof kinds)[number];

export const isValidKind = (value: string): value is RouteKind =>
  kinds.includes(value as RouteKind);

export type EnvironmentRole = "Forbidden" | "Optional" | "Required";

export interface Route<K extends RouteKind = RouteKind> {
  kind: K;
  parent?: RouteKind;
  path: string;
  generateLabel(params: RouteParams<K>): string;
  environmentRole: EnvironmentRole;
}

export interface RouteKindWithId<K extends RouteKind = RouteKind> {
  kind: K;
  params: RouteParams<K>;
}

/**
 * Only contains routes that have parameters (environment not included)
 */
interface RouteParamKeysManifest {
  InstanceComposer: "service";
  InstanceComposerEditor: "service" | "instance";
  Inventory: "service";
  ServiceDetails: "service";
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
  DesiredStateDetails: "version";
  DesiredStateResourceDetails: "version" | "resourceId";
  DesiredStateCompare: "from" | "to";
  ComplianceCheck: "version";
}

export type RouteParams<K extends RouteKind> =
  K extends keyof RouteParamKeysManifest
    ? Record<RouteParamKeysManifest[K], string>
    : undefined;

export interface RouteMatch {
  route: Route;
  params: RouteParams<RouteKind>;
}

export interface Crumb {
  kind: RouteKind;
  label: string;
  url: string;
  active: boolean;
}
