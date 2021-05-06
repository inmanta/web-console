import { ReactNode } from "react";
import {
  CreateInstancePageWithProvider,
  DiagnoseWithProvider,
  ServiceCatalogWithProvider,
  ServiceInstanceHistoryWithProvider,
  ServiceInventoryWithProvider,
  EventsWithProvider,
} from "@/UI/Pages";
import { matchPath, match } from "react-router-dom";

export enum Kinds {
  Catalog = "Catalog",
  Inventory = "Inventory",
  CreateInstance = "CreateInstance",
  History = "History",
  Diagnose = "Diagnose",
  Events = "Events",
}

export interface Page {
  kind: Kinds;
  parent?: Kinds;
  path: string;
  label: string;
  component: ReactNode;
}

export const CatalogPage: Page = {
  kind: Kinds.Catalog,
  path: "/lsm/catalog",
  label: "Service Catalog",
  component: ServiceCatalogWithProvider,
};

export const InventoryPage: Page = {
  kind: Kinds.Inventory,
  parent: Kinds.Catalog,
  path: "/lsm/catalog/:service/inventory",
  label: "Service Inventory",
  component: ServiceInventoryWithProvider,
};

export const CreateInstancePage: Page = {
  kind: Kinds.CreateInstance,
  parent: Kinds.Inventory,
  path: "/lsm/catalog/:service/inventory/add",
  label: "Create Instance",
  component: CreateInstancePageWithProvider,
};

export const HistoryPage: Page = {
  kind: Kinds.History,
  parent: Kinds.Inventory,
  path: "/lsm/catalog/:service/inventory/:instance/history",
  label: "Service Instance History",
  component: ServiceInstanceHistoryWithProvider,
};

export const DiagnosePage: Page = {
  kind: Kinds.Diagnose,
  parent: Kinds.Inventory,
  path: "/lsm/catalog/:service/inventory/:instance/diagnose",
  label: "Diagnose Service Instance",
  component: DiagnoseWithProvider,
};

export const EventsPage: Page = {
  kind: Kinds.Events,
  parent: Kinds.Inventory,
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
    case Kinds.Catalog:
      return CatalogPage;
    case Kinds.Inventory:
      return InventoryPage;
    case Kinds.History:
      return HistoryPage;
    case Kinds.CreateInstance:
      return CreateInstancePage;
    case Kinds.Diagnose:
      return DiagnosePage;
    case Kinds.Events:
      return EventsPage;
  }
};

export const getPagesFromPage = (page: Page, pages: Page[] = []): Page[] => {
  if (page.parent) {
    return getPagesFromPage(getPageFromKind(page.parent), [page, ...pages]);
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
