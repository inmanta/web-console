import { ReactElement } from "react";
import { RestrictedRouteKind, Route, RouteKind } from "@/Core/Domain";

export interface Page extends Route {
  element: ReactElement | null;
}

export interface PageManager {
  getPages(features?: string[]): Page[];
}

export type PageDictionary = Record<
  Exclude<RouteKind, RestrictedRouteKind>,
  Page
>;

export type RestrictedPageDictionary = Record<RestrictedRouteKind, Page>;
