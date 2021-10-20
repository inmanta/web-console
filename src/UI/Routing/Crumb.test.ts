import { getCrumbs } from "./Crumb";

test("GIVEN '/console/lsm/catalog' THEN breadcrumbs should be ['Home','Catalog']", () => {
  const crumbs = getCrumbs("/console/lsm/catalog");
  expect(crumbs).toHaveLength(2);
  expect(crumbs).toEqual([
    {
      kind: "Home",
      label: "Home",
      url: "/console/",
      active: false,
    },
    {
      kind: "Catalog",
      label: "Service Catalog",
      url: "/console/lsm/catalog",
      active: true,
    },
  ]);
});

test("GIVEN '/console/lsm/catalog/xyz/inventory' THEN breadcrumbs should be ['Home', 'Catalog', 'Inventory']", () => {
  const crumbs = getCrumbs("/console/lsm/catalog/xyz/inventory");
  expect(crumbs).toHaveLength(3);
  expect(crumbs).toEqual([
    {
      kind: "Home",
      label: "Home",
      url: "/console/",
      active: false,
    },
    {
      kind: "Catalog",
      label: "Service Catalog",
      url: "/console/lsm/catalog",
      active: false,
    },
    {
      kind: "Inventory",
      label: "Service Inventory",
      url: "/console/lsm/catalog/xyz/inventory",
      active: true,
    },
  ]);
});

test("GIVEN '/console/lsm/catalog/xyz/inventory/123/history' THEN breadcrumbs should be ['Home','Catalog', 'Inventory', 'History']", () => {
  const crumbs = getCrumbs("/console/lsm/catalog/xyz/inventory/123/history");
  expect(crumbs).toHaveLength(4);
  expect(crumbs).toEqual([
    {
      kind: "Home",
      label: "Home",
      url: "/console/",
      active: false,
    },
    {
      kind: "Catalog",
      label: "Service Catalog",
      url: "/console/lsm/catalog",
      active: false,
    },
    {
      kind: "Inventory",
      label: "Service Inventory",
      url: "/console/lsm/catalog/xyz/inventory",
      active: false,
    },
    {
      kind: "History",
      label: "Service Instance History",
      url: "/console/lsm/catalog/xyz/inventory/123/history",
      active: true,
    },
  ]);
});

test("GIVEN '/console/resources/123' THEN breadcrumbs should be ['Home', 'Resources', 'Resource Details']", () => {
  const crumbs = getCrumbs("/console/resources/123");
  expect(crumbs).toHaveLength(3);
  expect(crumbs).toEqual([
    {
      kind: "Home",
      label: "Home",
      url: "/console/",
      active: false,
    },
    {
      kind: "Resources",
      label: "Resources",
      url: "/console/resources",
      active: false,
    },
    {
      kind: "ResourceDetails",
      label: "Resource Details",
      url: "/console/resources/123",
      active: true,
    },
  ]);
});
