import { RouteManager, Route, RouteKind, RouteMatch } from "@/Core";

export class DummyRouteManager implements RouteManager {
  useUrl(): string {
    throw new Error("Method not implemented.");
  }
  isBaseUrlDefined(): boolean {
    throw new Error("Method not implemented.");
  }
  getRouteMatchFromUrl(): RouteMatch | undefined {
    throw new Error("Method not implemented.");
  }
  getLineageFromRoute(): Route[] {
    throw new Error("Method not implemented.");
  }
  getRelatedUrlWithoutParams(): string {
    throw new Error("Method not implemented.");
  }
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
