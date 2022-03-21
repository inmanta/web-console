import { PrimaryRouteManager } from "@/UI/Routing";
import { getCrumbs } from "./Crumb";

const routeManager = new PrimaryRouteManager("");

test("GIVEN '/lsm/catalog' THEN breadcrumbs should be ['Home','Catalog']", () => {
  const crumbs = getCrumbs(routeManager, "/lsm/catalog");
  expect(crumbs).toHaveLength(2);
  expect(crumbs).toEqual([
    {
      kind: "Home",
      label: "Home",
      url: "/",
      active: false,
    },
    {
      kind: "Catalog",
      label: "Service Catalog",
      url: "/lsm/catalog",
      active: true,
    },
  ]);
});

test("GIVEN '/lsm/catalog/xyz/inventory' THEN breadcrumbs should be ['Home', 'Catalog', 'Inventory']", () => {
  const crumbs = getCrumbs(routeManager, "/lsm/catalog/xyz/inventory");
  expect(crumbs).toHaveLength(3);
  expect(crumbs).toEqual([
    {
      kind: "Home",
      label: "Home",
      url: "/",
      active: false,
    },
    {
      kind: "Catalog",
      label: "Service Catalog",
      url: "/lsm/catalog",
      active: false,
    },
    {
      kind: "Inventory",
      label: "Service Inventory: xyz",
      url: "/lsm/catalog/xyz/inventory",
      active: true,
    },
  ]);
});

test("GIVEN '/lsm/catalog/xyz/inventory/123/history' THEN breadcrumbs should be ['Home','Catalog', 'Inventory', 'History']", () => {
  const crumbs = getCrumbs(
    routeManager,
    "/lsm/catalog/xyz/inventory/123/history"
  );
  expect(crumbs).toHaveLength(4);
  expect(crumbs).toEqual([
    {
      kind: "Home",
      label: "Home",
      url: "/",
      active: false,
    },
    {
      kind: "Catalog",
      label: "Service Catalog",
      url: "/lsm/catalog",
      active: false,
    },
    {
      kind: "Inventory",
      label: "Service Inventory: xyz",
      url: "/lsm/catalog/xyz/inventory",
      active: false,
    },
    {
      kind: "History",
      label: "Service Instance History",
      url: "/lsm/catalog/xyz/inventory/123/history",
      active: true,
    },
  ]);
});

test("GIVEN '/resources/123' THEN breadcrumbs should be ['Home', 'Resources', 'Resource Details']", () => {
  const crumbs = getCrumbs(routeManager, "/resources/123");
  expect(crumbs).toHaveLength(3);
  expect(crumbs).toEqual([
    {
      kind: "Home",
      label: "Home",
      url: "/",
      active: false,
    },
    {
      kind: "Resources",
      label: "Resources",
      url: "/resources",
      active: false,
    },
    {
      kind: "ResourceDetails",
      label: "Resource Details",
      url: "/resources/123",
      active: true,
    },
  ]);
});
