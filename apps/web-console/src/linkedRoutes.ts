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
    ComplianceCheck: { version: string }; // orchestration-engine
    CreateEnvironment: undefined; // environment
    CreateInstance: { service: string }; // lsm
    Dashboard: undefined; // environment
    DesiredState: undefined; // orchestration-engine
    DesiredStateDetails: { version: string }; // orchestration-engine
    DesiredStateResourceDetails: { version: string; resourceId: string }; // orchestration-engine
    Diagnose: { service: string; instance: string }; // lsm
    EditInstance: { service: string; instance: string }; // lsm
    Events: { service: string; instance: string }; // lsm
    Facts: undefined; // resource-manager
    InstanceDetails: { service: string; instance: string; instanceId: string }; // lsm
    Inventory: { service: string }; // lsm
    ResourceDetails: { resourceId: string }; // resource-manager
    Resources: undefined; // resource-manager
    Settings: undefined; // environment
    Status: undefined; // shell
  }
}
