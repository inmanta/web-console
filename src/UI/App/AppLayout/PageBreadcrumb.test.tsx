import React from "react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { render, screen, within } from "@testing-library/react";
import { PageBreadcrumb } from "./PageBreadcrumb";

test("GIVEN Breadcrumbs WHEN url is '/' THEN 0 Breadcrumbs are shown", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <PageBreadcrumb />
    </MemoryRouter>
  );

  expect(
    screen.queryByRole("listitem", { name: "BreadcrumbItem" })
  ).not.toBeInTheDocument();
});

test("GIVEN Breadcrumbs WHEN url is '/lsm/catalog' THEN plain Catalog Breadcrumb is shown", () => {
  render(
    <MemoryRouter initialEntries={["/lsm/catalog"]}>
      <PageBreadcrumb />
    </MemoryRouter>
  );

  const crumb = screen.getByRole("listitem", { name: "BreadcrumbItem" });
  expect(within(crumb).queryByRole("link")).not.toBeInTheDocument();
  expect(within(crumb).getByText("Service Catalog")).toBeInTheDocument();
});

test("GIVEN Breadcrumbs WHEN url is '/lsm/catalog/service/inventory' THEN linked Catalog Breadcrumb and plain Inventory breadcrumb is shown", () => {
  render(
    <MemoryRouter initialEntries={["/lsm/catalog/service/inventory"]}>
      <PageBreadcrumb />
    </MemoryRouter>
  );

  const crumbs = screen.getAllByRole("listitem", { name: "BreadcrumbItem" });
  expect(crumbs.length).toEqual(2);
  const [catalogCrumb, inventoryCrumb] = crumbs;
  expect(within(catalogCrumb).queryByRole("link")).toBeInTheDocument();
  expect(within(inventoryCrumb).queryByRole("link")).not.toBeInTheDocument();
  expect(
    within(inventoryCrumb).getByText("Service Inventory")
  ).toBeInTheDocument();
});

test("GIVEN Breadcrumbs on Inventory WHEN url contains env THEN catalog breadcrumb link also contains env", () => {
  render(
    <MemoryRouter initialEntries={["/lsm/catalog/service/inventory?env=env1"]}>
      <PageBreadcrumb />
    </MemoryRouter>
  );

  const link = screen.getByRole("link", { name: "Service Catalog" });
  expect(link).toHaveAttribute("href", "/lsm/catalog?env=env1");
});

test("GIVEN Breadcrumbs on Inventory WHEN user clicks catalog breadcrumb link THEN only plain catalog breadcrumb is shown", () => {
  render(
    <MemoryRouter initialEntries={["/lsm/catalog/service/inventory?env=env1"]}>
      <PageBreadcrumb />
    </MemoryRouter>
  );
  const crumbsBefore = screen.getAllByRole("listitem", {
    name: "BreadcrumbItem",
  });
  expect(crumbsBefore.length).toEqual(2);

  const link = screen.getByRole("link", { name: "Service Catalog" });
  userEvent.click(link);

  const crumbsAfter = screen.getAllByRole("listitem", {
    name: "BreadcrumbItem",
  });
  expect(crumbsAfter.length).toEqual(1);
  const crumb = crumbsAfter[0];
  expect(within(crumb).queryByRole("link")).not.toBeInTheDocument();
  expect(within(crumb).getByText("Service Catalog")).toBeInTheDocument();
});
