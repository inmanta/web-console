import { RouteManager } from "@/Core";
import { Kind, Route } from "@/UI/Routing";

export class DummyRouteManager implements RouteManager {
  getDashboardUrl(): string {
    throw new Error("Method not implemented.");
  }
  getRouteDictionary(): Record<Kind, Route.Route> {
    throw new Error("Method not implemented.");
  }
  getRoutes(): Route.Route[] {
    throw new Error("Method not implemented.");
  }
}
