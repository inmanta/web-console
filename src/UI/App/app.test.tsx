import React from "react";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import Keycloak from "keycloak-js";
import { App } from "@/UI/App/app";
import { getStoreInstance } from "@/UI";
import { AppLayout } from "./AppLayout/AppLayout";
import { MemoryRouter } from "react-router-dom";

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

  render(
    <StoreProvider store={getStoreInstance()}>
      <MemoryRouter>
        <AppLayout
          logoBaseUrl="/"
          keycloak={undefined}
          setErrorMessage={() => undefined}
          shouldUseAuth={false}
        >
          <span></span>
        </AppLayout>
      </MemoryRouter>
    </StoreProvider>
  );

  expect(
    screen.queryByRole("generic", { name: "PageSidebar" })
  ).not.toBeInTheDocument();

  userEvent.click(screen.getByRole("button", { name: "Global navigation" }));
  expect(screen.queryByRole("generic", { name: "PageSidebar" })).toBeVisible();
});
