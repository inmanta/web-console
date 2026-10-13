/**
 * The open registry of routes: maps each route kind to its path params (environment not included).
 * Core declares no routes. Every feature adds its own through declaration merging, next to the
 * route definition, so core doesn't need to know which features exist:
 *
 * @example
 * declare module "@/Core/Domain/Route" {
 *   interface RouteRegistry {
 *     CompileReports: undefined;
 *     CompileDetails: { id: string };
 *   }
 * }
 *
 * A route without path params maps to `undefined`.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RouteRegistry {}

export type RouteKind = keyof RouteRegistry;

export type RouteParams<K extends RouteKind> = RouteRegistry[K];

export type EnvironmentRole = "Forbidden" | "Optional" | "Required";

export interface Route<K extends RouteKind = RouteKind> {
  kind: K;
  parent?: RouteKind;
  path: string;
  generateLabel(params: RouteParams<K>): string;
  environmentRole: EnvironmentRole;
}

/**
 * Builds a route under the given base url. The app registers the routes it ships as a list of
 * these, so the route table only contains the features that are present.
 */
export type RouteFactory = (base: string) => Route;

export interface RouteKindWithId<K extends RouteKind = RouteKind> {
  kind: K;
  params: RouteParams<K>;
}

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
