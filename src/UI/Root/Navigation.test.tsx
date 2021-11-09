import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen, within } from "@testing-library/react";
import { ServerStatus } from "@/Core";
import { dependencies, ServerStatus as TestServerStatus } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { PrimaryRouteManager } from "@/UI/Routing";
import { Navigation } from "./Navigation";

function setup(
  initialEntries: string[] | undefined,
  serverStatus: ServerStatus
) {
  dependencies.featureManager.setServerStatus(serverStatus);
  const routeManager = new PrimaryRouteManager("");

  const component = (
    <MemoryRouter initialEntries={initialEntries}>
      <DependencyProvider dependencies={{ ...dependencies, routeManager }}>
        <Navigation environment="env" />
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component };
}

test("GIVEN Navigation WHEN lsm enabled THEN shows all navigation items", () => {
  const { component } = setup(undefined, TestServerStatus.withLsm);
  render(component);

  const navigation = screen.getByRole("navigation", { name: "Global" });
  expect(navigation).toBeVisible();
  expect(within(navigation).getAllByRole("region").length).toEqual(4);

  expect(
    within(navigation).getByRole("region", {
      name: "Lifecycle Service Manager",
    })
  ).toBeVisible();

  expect(
    within(navigation).getByRole("region", {
      name: "Orchestration Engine",
    })
  ).toBeVisible();

  expect(
    within(navigation).getByRole("region", {
      name: "Resource Manager",
    })
  ).toBeVisible();

  expect(
    within(navigation).getByRole("region", {
      name: "Other Sites",
    })
  ).toBeVisible();
});

test("GIVEN Navigation WHEN no lsm THEN lsm is not shown", () => {
  const { component } = setup(undefined, TestServerStatus.withoutLsm);
  render(component);

  const navigation = screen.getByRole("navigation", { name: "Global" });
  expect(navigation).toBeVisible();
  expect(within(navigation).getAllByRole("region").length).toEqual(3);

  expect(
    within(navigation).queryByRole("region", {
      name: "Lifecycle Service Manager",
    })
  ).not.toBeInTheDocument();
});

test("GIVEN Navigation WHEN on 'Service Catalog' THEN 'Service Catalog' is highlighted", () => {
  const { component } = setup(["/lsm/catalog"], TestServerStatus.withLsm);
  render(component);

  const navigation = screen.getByRole("navigation", { name: "Global" });
  const link = within(navigation).getByRole("link", {
    name: "Service Catalog",
  });
  expect(link).toHaveClass("pf-m-current");
});
