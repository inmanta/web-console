import { RouteManager } from "@/Core";
import { Kind, Route } from "@/UI/Routing";

export class DummyRouteManager implements RouteManager {
  getUrl(): string {
    throw new Error("Method not implemented.");
  }
  getDashboardUrl(): string {
    throw new Error("Method not implemented.");
  }
  getRouteDictionary(): Record<Kind, Route.Route> {
    throw new Error("Method not implemented.");
  }
}
