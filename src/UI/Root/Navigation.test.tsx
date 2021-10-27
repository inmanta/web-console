import React from "react";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DependencyProvider } from "@/UI/Dependency";
import { Navigation } from "./Navigation";
import { PrimaryFeatureManager } from "@/Data";
import { ServerStatus as TestServerStatus } from "@/Test";
import { PrimaryRouteManager } from "..";
import { ServerStatus } from "@/Core";

function setup(
  initialEntries: string[] | undefined,
  serverStatus: ServerStatus
) {
  const featureManager = new PrimaryFeatureManager();
  featureManager.setServerStatus(serverStatus);
  const routeManager = new PrimaryRouteManager("");

  const component = (
    <MemoryRouter initialEntries={initialEntries}>
      <DependencyProvider dependencies={{ featureManager, routeManager }}>
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
