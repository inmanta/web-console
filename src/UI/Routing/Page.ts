import { ComponentType } from "react";
import {
  CreateInstancePageWithProvider,
  DiagnoseWithProvider,
  ServiceCatalogWithProvider,
  ServiceInstanceHistoryWithProvider,
  ServiceInventoryWithProvider,
  EventsWithProvider,
} from "@/UI/Pages";
import { matchPath, match } from "react-router-dom";

export type Kinds =
  | "Catalog"
  | "Inventory"
  | "CreateInstance"
  | "History"
  | "Diagnose"
  | "Events";

interface PageParamsManifest {
  Catalog: undefined;
  Inventory: { service: string };
  CreateInstance: { service: string };
  History: { service: string; instance: string };
  Events: { service: string; instance: string };
  Diagnose: { service: string; instance: string };
}

export type PageParams<Page extends Kinds> = PageParamsManifest[Page];

export interface Page {
  kind: Kinds;
  parent?: Kinds;
  path: string;
  label: string;
  component: ComponentType;
}

export const CatalogPage: Page = {
  kind: "Catalog",
  path: "/lsm/catalog",
  label: "Service Catalog",
  component: ServiceCatalogWithProvider,
};

export const InventoryPage: Page = {
  kind: "Inventory",
  parent: "Catalog",
  path: "/lsm/catalog/:service/inventory",
  label: "Service Inventory",
  component: ServiceInventoryWithProvider,
};

export const CreateInstancePage: Page = {
  kind: "CreateInstance",
  parent: "Inventory",
  path: "/lsm/catalog/:service/inventory/add",
  label: "Create Instance",
  component: CreateInstancePageWithProvider,
};

export const HistoryPage: Page = {
  kind: "History",
  parent: "Inventory",
  path: "/lsm/catalog/:service/inventory/:instance/history",
  label: "Service Instance History",
  component: ServiceInstanceHistoryWithProvider,
};

export const DiagnosePage: Page = {
  kind: "Diagnose",
  parent: "Inventory",
  path: "/lsm/catalog/:service/inventory/:instance/diagnose",
  label: "Diagnose Service Instance",
  component: DiagnoseWithProvider,
};

export const EventsPage: Page = {
  kind: "Events",
  parent: "Inventory",
  label: "Service Instance Events",
  path: "/lsm/catalog/:service/inventory/:instance/events",
  component: EventsWithProvider,
};

export const pages: Page[] = [
  CatalogPage,
  InventoryPage,
  CreateInstancePage,
  HistoryPage,
  DiagnosePage,
  EventsPage,
];

export const getPageFromKind = (kind: Kinds): Page => {
  switch (kind) {
    case "Catalog":
      return CatalogPage;
    case "Inventory":
      return InventoryPage;
    case "History":
      return HistoryPage;
    case "CreateInstance":
      return CreateInstancePage;
    case "Diagnose":
      return DiagnosePage;
    case "Events":
      return EventsPage;
  }
};

export const getLineageFromPage = (page: Page, pages: Page[] = []): Page[] => {
  if (page.parent) {
    return getLineageFromPage(getPageFromKind(page.parent), [page, ...pages]);
  }
  return [page, ...pages];
};

type Params = Record<string, string>;

export function getPageWithParamsFromUrl(
  url: string
): [Page, Params] | undefined {
  const pageMatchPairs = pages.map((page) => [
    page,
    matchPath<Params>(url, { path: page.path, exact: true }),
  ]);
  const pageWithMatch = pageMatchPairs.find(
    (pair): pair is [Page, match<Params>] => pair[1] !== null
  );
  if (typeof pageWithMatch === "undefined") return undefined;
  const [page, match] = pageWithMatch;
  return [page, match.params];
}
