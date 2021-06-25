import React from "react";
import { render, screen, within } from "@testing-library/react";
import { Navigation } from "./Navigation";
import { MemoryRouter } from "react-router-dom";

test("GIVEN Navigation THEN shows navigation items", () => {
  render(
    <MemoryRouter>
      <Navigation environment="env" />
    </MemoryRouter>
  );

  const navigation = screen.getByRole("navigation", { name: "Global" });
  expect(navigation).toBeVisible();
  expect(within(navigation).getAllByRole("region").length).toEqual(3);

  expect(
    within(navigation).getByRole("region", {
      name: "Lifecycle Service Manager",
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

test("GIVEN Navigation WHEN on 'Service Catalog' THEN 'Service Catalog' is highlighted", () => {
  render(
    <MemoryRouter initialEntries={["/lsm/catalog"]}>
      <Navigation environment="env" />
    </MemoryRouter>
  );

  const navigation = screen.getByRole("navigation", { name: "Global" });
  const link = within(navigation).getByRole("link", {
    name: "Service Catalog",
  });
  expect(link).toHaveClass("pf-m-current");
});
