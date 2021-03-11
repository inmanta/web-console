import React from "react";
import { App } from "@/UI/App/app";
import { mount } from "enzyme";
import { Button } from "@patternfly/react-core";
import Keycloak from "keycloak-js";
import { waitFor } from "@testing-library/react";
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
