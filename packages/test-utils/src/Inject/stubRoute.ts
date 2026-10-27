import {
  EnvironmentRole,
  Route,
  RouteFactory,
  RouteKind,
  RouteParams,
} from "@inmanta/web-console-core";

/**
 * The path and parent of the routes that tests stub, as the features declare them.
 * `src/appStubRoutes.test.ts` checks them against the app's real routes.
 */
export const stubbedRoutes = {
  Dashboard: { path: "/dashboard" },
  Agents: { path: "/agents", parent: "Dashboard" },
  Facts: { path: "/facts", parent: "Dashboard" },
  Settings: { path: "/settings", parent: "Dashboard" },
  Status: { path: "/status", parent: "Dashboard" },
  CreateEnvironment: { path: "/environment/create", parent: "Dashboard" },
  Catalog: { path: "/lsm/catalog", parent: "Dashboard" },
  Inventory: { path: "/lsm/catalog/:service/inventory", parent: "Catalog" },
  CreateInstance: { path: "/lsm/catalog/:service/inventory/add", parent: "Inventory" },
  EditInstance: { path: "/lsm/catalog/:service/inventory/:instance/edit", parent: "Inventory" },
  Events: { path: "/lsm/catalog/:service/inventory/:instance/events", parent: "Inventory" },
  Diagnose: { path: "/lsm/catalog/:service/inventory/:instance/diagnose", parent: "Inventory" },
  InstanceDetails: {
    path: "/lsm/catalog/:service/inventory/:instance/:instanceId/details",
    parent: "Inventory",
  },
  Resources: { path: "/resources", parent: "Dashboard" },
  ResourceDetails: { path: "/resources/:resourceId", parent: "Resources" },
  CompileReports: { path: "/compilereports", parent: "Dashboard" },
  CompileDetails: { path: "/compilereports/:id", parent: "CompileReports" },
  DesiredState: { path: "/desiredstate", parent: "Dashboard" },
  DesiredStateDetails: { path: "/desiredstate/:version", parent: "DesiredState" },
  DesiredStateResourceDetails: {
    path: "/desiredstate/:version/resource/:resourceId",
    parent: "DesiredStateDetails",
  },
  ComplianceCheck: { path: "/desiredstate/:version/compliancecheck", parent: "DesiredState" },
} satisfies Partial<Record<RouteKind, { path: string; parent?: RouteKind }>>;

export type StubbedRouteKind = keyof typeof stubbedRoutes;

interface StubRouteOptions<K extends StubbedRouteKind> {
  /**
   * Whether the page needs an environment. Defaults to "Optional".
   */
  environmentRole?: EnvironmentRole;

  /**
   * The label of the page, e.g. in breadcrumbs. Defaults to the kind.
   */
  label?: (params: RouteParams<K>) => string;
}

/**
 * Returns a route for a page of the shell or of another feature, so a test can render links to
 * that page without importing what owns it. Its path and parent are the real ones, from
 * `stubbedRoutes`.
 *
 * @example
 * <MockedDependencyProvider routes={[stubRoute("CompileDetails")]}>
 *
 * @param kind - the kind of the route
 * @param options - the environment role and label of the route
 * @returns a route factory to pass to `MockedDependencyProvider` in its `routes`
 */
export const stubRoute =
  <K extends StubbedRouteKind>(
    kind: K,
    { environmentRole = "Optional", label = () => kind }: StubRouteOptions<K> = {}
  ): RouteFactory =>
  (base): Route<K> => {
    const stubbed: { path: string; parent?: RouteKind } = stubbedRoutes[kind];

    return {
      kind,
      parent: stubbed.parent,
      path: `${base}${stubbed.path}`,
      generateLabel: label,
      environmentRole,
    };
  };
