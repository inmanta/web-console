import { ReactElement } from "react";
import { Route } from "@/Core/Domain";

export interface Page extends Route {
  element: ReactElement | null;
}

export interface PageManager {
  getPages(features?: string[]): Page[];

  /**
   * Fetches the pages in the background while the browser is idle, so they open without a
   * loading view.
   *
   * @returns a function that stops fetching the pages that are not fetched yet
   */
  preloadPages(): () => void;
}
