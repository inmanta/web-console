import { ReactElement } from "react";
import { Route, RouteKind } from "@/Core/Domain";

export interface Page extends Route {
  element: ReactElement | null;
}

export interface PageManager {
  getPages(): Page[];
}

export type PageDictionary = Record<RouteKind, Page>;
