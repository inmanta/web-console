import React from "react";
import { App } from "@/UI/App/app";
import { mount } from "enzyme";
import { Button } from "@patternfly/react-core";
import Keycloak from "keycloak-js";
import { waitFor, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { getStoreInstance } from "@/UI";

describe("App tests", () => {
  fetchMock.mockResponse(JSON.stringify({}));
  let keycloak: Keycloak.KeycloakInstance;
  beforeEach(() => {
    keycloak = Keycloak();
  });

  it("should render a nav-toggle button", async () => {
    const wrapper = mount(
      <StoreProvider store={getStoreInstance()}>
        <App keycloak={keycloak} shouldUseAuth={false} />
      </StoreProvider>
    );
    const button = wrapper.find(Button);
    await waitFor(() => undefined);
    expect(button.exists()).toBe(true);
  });

  it("should hide the sidebar when clicking the nav-toggle button", async () => {
    const wrapper = mount(
      <StoreProvider store={getStoreInstance()}>
        <App keycloak={keycloak} shouldUseAuth={false} />
      </StoreProvider>
    );
    const button = wrapper.find("#nav-toggle").hostNodes();
    expect(wrapper.find("#page-sidebar").hasClass("pf-m-expanded"));
    button.simulate("click");
    await waitFor(() => undefined);
    expect(wrapper.find("#page-sidebar").hasClass("pf-m-collapsed"));
  });
});

test("GIVEN the application WHEN showing the main page THEN the navigation toggle button should be visible", async () => {
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

test.skip("GIVEN the page WHEN clicking the navigation toggle THEN the sidebar should be hidden", async () => {
  fetchMock.mockResponse(JSON.stringify({ data: [] }));
  const keycloak = Keycloak();

  render(
    <StoreProvider store={getStoreInstance()}>
      <App keycloak={keycloak} shouldUseAuth={false} />
    </StoreProvider>
  );

  const toggle = await screen.findByRole("button", {
    name: "Global navigation",
  });
  const sidebar = await screen.findByRole("generic", { name: "PageSidebar" });
  expect(sidebar).toBeVisible();

  userEvent.click(toggle);

  const sidebar2 = await screen.findByRole("generic", { name: "PageSidebar" });
  expect(sidebar2).not.toBeVisible();
});
