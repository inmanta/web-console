/**
 * Types the tests of this package use beyond the code they import: the routes of other features
 * they name, declared like in linkedRoutes.ts (#7461).
 */
export {};

declare module "@inmanta/web-console-core/Domain/Route" {
  interface RouteRegistry {
    Agents: undefined; // resource-manager
    Catalog: undefined; // lsm
    CompileDetails: { id: string }; // orchestration-engine
    CreateInstance: { service: string }; // lsm
    Dashboard: undefined; // environment
    DesiredStateResourceDetails: { version: string; resourceId: string }; // orchestration-engine
    Diagnose: { service: string; instance: string }; // lsm
    Events: { service: string; instance: string }; // lsm
    InstanceDetails: { service: string; instance: string; instanceId: string }; // lsm
    Inventory: { service: string }; // lsm
    ResourceDetails: { resourceId: string }; // resource-manager
    Resources: undefined; // resource-manager
  }
}
