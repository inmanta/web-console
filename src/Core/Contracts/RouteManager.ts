import { Kind, Route } from "@/UI/Routing";
import { Params } from "@/UI/Routing/Route";

export type RouteDictionary = Record<Kind, Route.Route>;

export interface RouteManager {
  getRouteDictionary(): RouteDictionary;
  getDashboardUrl(environment: string): string;
  getUrl(kind: Kind, params: Params<typeof kind>): string;
}
