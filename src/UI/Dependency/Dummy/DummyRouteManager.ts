import {
  RouteManager,
  Route,
  RouteKind,
  RouteMatch,
  Crumb,
  RouteKindWithId,
} from "@/Core";

export class DummyRouteManager implements RouteManager {
  getCrumbs(): Crumb[] {
    throw new Error("Method not implemented.");
  }
  getRoute<K extends RouteKind>(): Route<K> {
    throw new Error("Method not implemented.");
  }
  getUrlForApiUri(): string | undefined {
    throw new Error("Method not implemented.");
  }
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
  getParamsFromUrl(): RouteKindWithId<"CompileDetails"> | undefined {
    throw new Error("Method not implemented.");
  }
}
