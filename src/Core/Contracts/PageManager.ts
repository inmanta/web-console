import { ReactElement } from "react";
import { Route } from "@/Core/Domain";

export interface Page extends Route {
  element: ReactElement | null;
}

export interface PageManager {
  getPages(): Page[];
}
