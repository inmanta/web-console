import { Kind, Route } from "@/UI/Routing";

export type RouteDictionary = Record<Kind, Route.Route>;

export interface RouteManager {
  getRoutes(): Route.Route[];
  getRouteDictionary(): RouteDictionary;
  getDashboardUrl(environment: string): string;
}
