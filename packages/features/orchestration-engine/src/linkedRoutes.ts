/**
 * The routes of other features that this package names, for links or as a parent page. A package
 * can't import another feature, so it declares those routes itself, with the same params as the
 * feature that owns them (#7461). The app's type check loads every feature, so it fails when a
 * declaration here no longer matches the owner's.
 */
export {};

declare module "@inmanta/web-console-core/Domain/Route" {
  interface RouteRegistry {
    Dashboard: undefined; // environment
  }
}
