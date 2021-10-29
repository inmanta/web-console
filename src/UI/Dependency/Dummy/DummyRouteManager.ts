import { RouteManager, Route, RouteKind, MatchedParams } from "@/Core";

export class DummyRouteManager implements RouteManager {
  getRouteWithParamsFromUrl(): [Route, MatchedParams] | undefined {
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
