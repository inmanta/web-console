import React from "react";
import { App } from "@app/index";
import { mount } from "enzyme";
import Keycloak from "keycloak-js";
import { waitFor } from "@testing-library/react";

describe("Navigation", () => {
  let keycloak: Keycloak.KeycloakInstance;
  beforeEach(() => {
    keycloak = Keycloak();
  });

  it("should render nav groups", async () => {
    const wrapper = mount(<App keycloak={keycloak} shouldUseAuth={false} />);
    const nav = wrapper.find("#nav-primary-simple");
    await waitFor(() => undefined);
    expect(nav.find(".pf-c-nav__section-title")).toHaveLength(2);
  });

  it("should navigate when clicking on link", async () => {
    const wrapper = mount(<App keycloak={keycloak} shouldUseAuth={false} />);
    const nav = wrapper.find("#nav-primary-simple");
    const serviceCatalogEntry = nav.find(".pf-c-nav__link").first();
    serviceCatalogEntry.simulate("click");
    await waitFor(() => undefined);
    expect(serviceCatalogEntry.getElement().props.activeClassName).toEqual(
      "pf-m-current"
    );
  });
});
