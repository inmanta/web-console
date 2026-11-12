/**
 * Types the tests of this package use beyond the code they import: the routes of other features
 * this package names (linkedRoutes.ts), and the ones only its tests name, declared the same way.
 */
import type {} from "./linkedRoutes";

declare module "@inmanta/web-console-core/Domain/Route" {
  interface RouteRegistry {
    Agents: undefined; // resource-manager
    Resources: undefined; // resource-manager
  }
}
