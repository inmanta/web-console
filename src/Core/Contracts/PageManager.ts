import { ReactElement } from "react";
import { Route } from "@/Core/Domain";

export interface Page extends Route {
  element: ReactElement | null;
}

export interface PageManager {
  /**
   * @returns a page for each registered route, rendering the page of the feature that declares it
   */
  getPages(): Page[];

  /**
   * Fetches the pages in the background while the browser is idle, so they open without a
   * loading view.
   *
   * @returns a function that stops fetching the pages that are not fetched yet
   */
  preloadPages(): () => void;
}
