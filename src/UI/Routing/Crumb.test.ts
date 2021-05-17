import { getCrumbs } from "./Crumb";

test("GIVEN '/lsm/catalog' THEN breadcrumbs should be ['Catalog']", () => {
  const crumbs = getCrumbs("/lsm/catalog");
  expect(crumbs).toHaveLength(1);
  expect(crumbs[0]).toEqual({
    kind: "Catalog",
    label: "Service Catalog",
    url: "/lsm/catalog",
    active: true,
  });
});

test("GIVEN '/lsm/catalog/xyz/inventory' THEN breadcrumbs should be ['Catalog', 'Inventory']", () => {
  const crumbs = getCrumbs("/lsm/catalog/xyz/inventory");
  expect(crumbs).toHaveLength(2);
  expect(crumbs).toEqual([
    {
      kind: "Catalog",
      label: "Service Catalog",
      url: "/lsm/catalog",
      active: false,
    },
    {
      kind: "Inventory",
      label: "Service Inventory",
      url: "/lsm/catalog/xyz/inventory",
      active: true,
    },
  ]);
});

test("GIVEN '/lsm/catalog/xyz/inventory/123/history' THEN breadcrumbs should be ['Catalog', 'Inventory', 'History']", () => {
  const crumbs = getCrumbs("/lsm/catalog/xyz/inventory/123/history");
  expect(crumbs).toHaveLength(3);
  expect(crumbs).toEqual([
    {
      kind: "Catalog",
      label: "Service Catalog",
      url: "/lsm/catalog",
      active: false,
    },
    {
      kind: "Inventory",
      label: "Service Inventory",
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
