import React from "react";
import { MemoryRouter } from "react-router-dom";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DependencyProvider } from "@/UI/Dependency";
import { PrimaryRouteManager } from "@/UI/Routing";
import { PageBreadcrumbs } from "./PageBreadcrumbs";

function setup(initialEntries?: string[]) {
  const component = (
    <DependencyProvider
      dependencies={{ routeManager: PrimaryRouteManager("") }}
    >
      <MemoryRouter initialEntries={initialEntries}>
        <PageBreadcrumbs />
      </MemoryRouter>
    </DependencyProvider>
  );

  return { component };
}

test("GIVEN Breadcrumbs WHEN url is '/' THEN 0 Breadcrumbs are shown", () => {
  const { component } = setup(["/"]);
  render(component);
  const crumb = screen.getByRole("listitem", { name: "BreadcrumbItem" });
  expect(within(crumb).queryByRole("link")).not.toBeInTheDocument();
  expect(within(crumb).getByText("Home")).toBeInTheDocument();
});

test("GIVEN Breadcrumbs WHEN url is '/lsm/catalog' THEN plain Catalog Breadcrumb is shown", () => {
  const { component } = setup(["/lsm/catalog"]);
  render(component);

  const crumbs = screen.getAllByRole("listitem", { name: "BreadcrumbItem" });
  expect(crumbs.length).toEqual(2);
  const [homeCrumb, catalogCrumb] = crumbs;
  expect(within(homeCrumb).getByRole("link")).toBeInTheDocument();
  expect(within(catalogCrumb).getByText("Service Catalog")).toBeInTheDocument();
});

test("GIVEN Breadcrumbs WHEN url is '/lsm/catalog/service/inventory' THEN linked Catalog Breadcrumb and plain Inventory breadcrumb is shown", () => {
  const { component } = setup(["/lsm/catalog/service/inventory"]);
  render(component);
  const crumbs = screen.getAllByRole("listitem", { name: "BreadcrumbItem" });
  expect(crumbs.length).toEqual(3);
  const [, catalogCrumb, inventoryCrumb] = crumbs;
  expect(within(catalogCrumb).getByRole("link")).toBeInTheDocument();
  expect(within(inventoryCrumb).queryByRole("link")).not.toBeInTheDocument();
  expect(
    within(inventoryCrumb).getByText("Service Inventory: service"),
  ).toBeInTheDocument();
});

test("GIVEN Breadcrumbs on Inventory WHEN url contains env THEN catalog breadcrumb link also contains env", () => {
  const { component } = setup(["/lsm/catalog/service/inventory?env=env1"]);
  render(component);
  const link = screen.getByRole("link", { name: "Service Catalog" });
  expect(link).toHaveAttribute("href", "/lsm/catalog?env=env1");
});

test("GIVEN Breadcrumbs on Inventory WHEN user clicks catalog breadcrumb link THEN only plain catalog breadcrumb is shown", async () => {
  const { component } = setup(["/lsm/catalog/service/inventory?env=env1"]);
  render(component);
  const crumbsBefore = screen.getAllByRole("listitem", {
    name: "BreadcrumbItem",
  });
  expect(crumbsBefore.length).toEqual(3);

  const link = screen.getByRole("link", { name: "Service Catalog" });
  await act(async () => {
    await userEvent.click(link);
  });

  const crumbsAfter = screen.getAllByRole("listitem", {
    name: "BreadcrumbItem",
  });

  expect(crumbsAfter.length).toEqual(2);

  const crumb = crumbsAfter[1];

  expect(within(crumb).queryByRole("link")).not.toBeInTheDocument();
  expect(within(crumb).getByText("Service Catalog")).toBeInTheDocument();
});

test("GIVEN Breadcrumbs on Add Instance WHEN user clicks inventory breadcrumb link THEN Add instance breadcrumb is removed", async () => {
  const { component } = setup(["/lsm/catalog/service/inventory/add?env=env1"]);
  render(component);
  const crumbsBefore = screen.getAllByRole("listitem", {
    name: "BreadcrumbItem",
  });
  expect(crumbsBefore.length).toEqual(4);

  const link = screen.getByRole("link", { name: "Service Inventory: service" });

  await act(async () => {
    await userEvent.click(link);
  });

  const crumbsAfter = screen.getAllByRole("listitem", {
    name: "BreadcrumbItem",
  });

  expect(crumbsAfter.length).toEqual(3);
  expect(
    within(crumbsAfter[1]).getByText("Service Catalog"),
  ).toBeInTheDocument();
  expect(
    within(crumbsAfter[2]).getByText("Service Inventory: service"),
  ).toBeInTheDocument();
});
