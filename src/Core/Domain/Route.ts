const kinds = [
  /**
   * Main
   */
  "CreateEnvironment",
  "Home",
  "NotificationCenter",
  "Settings",
  "Status",

  /**
   * LSM
   */
  "Catalog",
  "CreateInstance",
  "Dashboard",
  "Diagnose",
  "DuplicateInstance",
  "EditInstance",
  "Events",
  "History",
  "InstanceComposer",
  "InstanceComposerEditor",
  "Inventory",
  "Orders",
  "OrderDetails",
  "ServiceDetails",

  /**
   * Resource Manager
   */
  "AgentProcess",
  "Agents",
  "DiscoveredResources",
  "Facts",
  "ResourceDetails",
  "Resources",

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

export type RestrictedRouteKind = "InstanceComposer" | "InstanceComposerEditor";

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
  AgentProcess: "id";
  CompileDetails: "id";
  ComplianceCheck: "version";
  CreateInstance: "service";
  DesiredStateCompare: "from" | "to";
  DesiredStateDetails: "version";
  DesiredStateResourceDetails: "version" | "resourceId";
  Diagnose: "service" | "instance";
  DuplicateInstance: "service" | "instance";
  EditInstance: "service" | "instance";
  Events: "service" | "instance";
  History: "service" | "instance";
  InstanceComposer: "service";
  InstanceComposerEditor: "service" | "instance";
  Inventory: "service";
  ResourceDetails: "resourceId";
  ResourceHistory: "resourceId";
  ResourceLogs: "resourceId";
  ServiceDetails: "service";
  OrderDetails: "id";
}

export type RouteParams<K extends RouteKind> =
  K extends keyof RouteParamKeysManifest
    ? Record<RouteParamKeysManifest[K], string>
    : undefined;

export interface RouteMatch {
  params: RouteParams<RouteKind>;
  route: Route;
}

export interface Crumb {
  kind: RouteKind;
  label: string;
  url: string;
  active: boolean;
}
