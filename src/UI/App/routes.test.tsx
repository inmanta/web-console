import React from "react";
import { App } from "@/UI/App/app";
import Keycloak from "keycloak-js";
import { render, screen, within } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { getStoreInstance } from "@/UI/Store";
import userEvent from "@testing-library/user-event";

test("GIVEN Navigation THEN shows navigation items", () => {
  fetchMock.mockResponse(JSON.stringify({ data: [] }));
  render(
    <StoreProvider store={getStoreInstance()}>
      <App keycloak={Keycloak()} shouldUseAuth={false} />
    </StoreProvider>
  );

  userEvent.click(screen.getByRole("button", { name: "Global navigation" }));

  const navigation = screen.getByRole("navigation", { name: "Global" });
  expect(navigation).toBeVisible();

  expect(within(navigation).getAllByRole("region").length).toEqual(2);

  expect(
    within(navigation).getByRole("region", {
      name: "Lifecycle service management",
    })
  ).toBeVisible();

  expect(
    within(navigation).getByRole("region", {
      name: "Other sites",
    })
  ).toBeVisible();
});

test("GIVEN Navigation WHEN on 'Service Catalog' THEN 'Service Catalog' is highlighted", () => {
  fetchMock.mockResponse(JSON.stringify({ data: [] }));
  window.history.replaceState({}, "", "/lsm/catalog");
  render(
    <StoreProvider store={getStoreInstance()}>
      <App keycloak={Keycloak()} shouldUseAuth={false} />
    </StoreProvider>
  );
  userEvent.click(screen.getByRole("button", { name: "Global navigation" }));
  const navigation = screen.getByRole("navigation", { name: "Global" });
  const link = within(navigation).getByRole("link", {
    name: "Service Catalog",
  });
  expect(link).toHaveClass("pf-m-current");
});
