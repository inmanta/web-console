import { ComponentType } from "react";
import { Route } from "@/Core/Domain";

export interface Page extends Route {
  component: ComponentType;
}

export interface PageManager {
  getPages(): Page[];
}
