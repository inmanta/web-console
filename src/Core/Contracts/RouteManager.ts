import { RouteKind, Route, RouteParams } from "@/Core/Domain";

export type RouteDictionary = Record<RouteKind, Route>;

export interface RouteManager {
  getRouteDictionary(): RouteDictionary;
  getDashboardUrl(environment: string): string;
  getUrl(kind: RouteKind, params: RouteParams<typeof kind>): string;
}
