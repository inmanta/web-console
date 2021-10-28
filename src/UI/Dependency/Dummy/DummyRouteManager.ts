import { RouteManager, Route, RouteKind } from "@/Core";

export class DummyRouteManager implements RouteManager {
  getUrl(): string {
    throw new Error("Method not implemented.");
  }
  getRoutes(): Route[] {
    throw new Error("Method not implemented.");
  }
  getRouteDictionary(): Record<RouteKind, Route> {
    throw new Error("Method not implemented.");
  }
  getRoute(): Route {
    throw new Error("Method not implemented.");
  }
}
