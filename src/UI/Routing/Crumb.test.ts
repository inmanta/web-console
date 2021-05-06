import { getBreadcrumbs } from "./Crumb";

test("GIVEN '/lsm/catalog' THEN breadcrumbs should be ['Catalog']", () => {
  const crumbs = getBreadcrumbs("/lsm/catalog");
  expect(crumbs).toHaveLength(1);
  expect(crumbs[0]).toEqual({
    label: "Service Catalog",
    url: "/lsm/catalog",
    active: true,
  });
});

test("GIVEN '/lsm/catalog/xyz/inventory' THEN breadcrumbs should be ['Catalog', 'Inventory']", () => {
  const crumbs = getBreadcrumbs("/lsm/catalog/xyz/inventory");
  expect(crumbs).toHaveLength(2);
  expect(crumbs).toEqual([
    {
      label: "Service Catalog",
      url: "/lsm/catalog",
      active: false,
    },
    {
      label: "Service Inventory",
      url: "/lsm/catalog/xyz/inventory",
      active: true,
    },
  ]);
});

test("GIVEN '/lsm/catalog/xyz/inventory/123/history' THEN breadcrumbs should be ['Catalog', 'Inventory', 'History']", () => {
  const crumbs = getBreadcrumbs("/lsm/catalog/xyz/inventory/123/history");
  expect(crumbs).toHaveLength(3);
  expect(crumbs).toEqual([
    {
      label: "Service Catalog",
      url: "/lsm/catalog",
      active: false,
    },
    {
      label: "Service Inventory",
      url: "/lsm/catalog/xyz/inventory",
      active: false,
    },
    {
      label: "Service Instance History",
      url: "/lsm/catalog/xyz/inventory/123/history",
      active: true,
    },
  ]);
});
