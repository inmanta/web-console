import React from "react";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import Keycloak from "keycloak-js";
import { App } from "@/UI/App/app";
import { getStoreInstance } from "@/UI";

test("GIVEN the app THEN the navigation toggle button should be visible", async () => {
  fetchMock.mockResponse(JSON.stringify({}));
  const keycloak = Keycloak();

  render(
    <StoreProvider store={getStoreInstance()}>
      <App keycloak={keycloak} shouldUseAuth={false} />
    </StoreProvider>
  );

  expect(
    await screen.findByRole("button", { name: "Global navigation" })
  ).toBeVisible();
});

/**
 * The sidebar starts out 'collapsed' because of JSDOM default window dimensions.
 * On desktop sizes it would start out 'expanded'.
 */
test("GIVEN the app WHEN clicking the navigation toggle THEN the sidebar should be expanded", async () => {
  fetchMock.mockResponse(JSON.stringify({}));
  const keycloak = Keycloak();

  render(
    <StoreProvider store={getStoreInstance()}>
      <App keycloak={keycloak} shouldUseAuth={false} />
    </StoreProvider>
  );

  const sidebar = await screen.findByRole("generic", { name: "PageSidebar" });
  expect(sidebar).toHaveClass("pf-m-collapsed");

  userEvent.click(screen.getByRole("button", { name: "Global navigation" }));
  expect(sidebar).toHaveClass("pf-m-expanded");
});
