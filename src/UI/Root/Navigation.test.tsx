import React from "react";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DependencyProvider } from "@/UI/Dependency";
import { Navigation } from "./Navigation";
import { PrimaryFeatureManager } from "@/Data";
import { ServerStatus } from "@/Test";

test("GIVEN Navigation WHEN lsm enabled THEN shows all navigation items", () => {
  const featureManager = new PrimaryFeatureManager();
  featureManager.setServerStatus(ServerStatus.withLsm);

  render(
    <MemoryRouter>
      <DependencyProvider dependencies={{ featureManager }}>
        <Navigation environment="env" />
      </DependencyProvider>
    </MemoryRouter>
  );

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
  const featureManager = new PrimaryFeatureManager();
  featureManager.setServerStatus(ServerStatus.withoutLsm);
  render(
    <MemoryRouter>
      <DependencyProvider dependencies={{ featureManager }}>
        <Navigation environment="env" />
      </DependencyProvider>
    </MemoryRouter>
  );

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
  const featureManager = new PrimaryFeatureManager();
  featureManager.setServerStatus(ServerStatus.withLsm);
  render(
    <MemoryRouter initialEntries={["/lsm/catalog"]}>
      <DependencyProvider dependencies={{ featureManager }}>
        <Navigation environment="env" />
      </DependencyProvider>
    </MemoryRouter>
  );

  const navigation = screen.getByRole("navigation", { name: "Global" });
  const link = within(navigation).getByRole("link", {
    name: "Service Catalog",
  });
  expect(link).toHaveClass("pf-m-current");
});
