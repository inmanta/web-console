import { EnvironmentRole, Route, RouteFactory, RouteKind } from "@inmanta/web-console-core";

interface StubRouteOptions {
  /**
   * The parent route, for breadcrumbs and lineage.
   */
  parent?: RouteKind;

  /**
   * Whether the page needs an environment. Defaults to "Optional".
   */
  environmentRole?: EnvironmentRole;

  /**
   * The label of the page, e.g. in breadcrumbs. Defaults to the kind.
   */
  label?: (params: Record<string, string>) => string;
}

/**
 * Returns a route for a page of the shell or of another feature, so a test can render links to
 * that page without importing what owns it.
 *
 * @example
 * <MockedDependencyProvider routes={[stubRoute("CompileDetails", "/compilereports/:id")]}>
 *
 * @param kind - the kind of the route
 * @param path - the path of the route, with its params, e.g. "/compilereports/:id"
 * @param options - the parent, environment role and label of the route
 * @returns a route factory to pass to `MockedDependencyProvider` in its `routes`
 */
export const stubRoute =
  (
    kind: RouteKind,
    path: string,
    { parent, environmentRole = "Optional", label = () => kind }: StubRouteOptions = {}
  ): RouteFactory =>
  (base) => ({
    kind,
    parent,
    path: `${base}${path}`,
    generateLabel: label as Route["generateLabel"],
    environmentRole,
  });
