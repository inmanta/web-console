/**
 * Types the tests of this package use beyond the code they import: the words of this package, which
 * its tests read through words(), and the routes of other features they name, declared like in
 * linkedRoutes.ts (#7461).
 */
import type {} from "./messages";

export {};

declare module "@inmanta/web-console-core/Domain/Route" {
  interface RouteRegistry {
    ComplianceCheck: { version: string }; // orchestration-engine
  }
}
