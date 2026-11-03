/**
 * The routes of other features that this package names, for links or as a parent page. A package
 * can't import another feature, so it declares those routes itself, with the same params as the
 * feature that owns them (#7461). `yarn tsc` checks them against the owner's declaration
 * (scripts/check-linked-routes.js).
 */
export {};

declare module "@inmanta/web-console-core/Domain/Route" {
  interface RouteRegistry {
    Agents: undefined; // resource-manager
    Catalog: undefined; // lsm
    CompileDetails: { id: string }; // orchestration-engine
    CompileReports: undefined; // orchestration-engine
    DesiredState: undefined; // orchestration-engine
    Resources: undefined; // resource-manager
    Status: undefined; // shell
  }
}
