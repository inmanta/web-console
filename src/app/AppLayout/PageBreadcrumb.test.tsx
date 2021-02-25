import { PageBreadcrumb } from "./PageBreadcrumb";
import { mount } from "enzyme";
import React from "react";
import { MemoryRouter, Router } from "react-router-dom";
import { createMemoryHistory } from "history";

describe("Breadcrumbs", () => {
  it.each`
    entry                               | numberOfItems
    ${"/"}                              | ${0}
    ${"/support"}                       | ${0}
    ${"/lsm/catalog"}                   | ${1}
    ${"/lsm/catalog/service/inventory"} | ${2}
  `(
    "Should render $numberOfItems breadcrumb items for $entry",
    ({ entry, numberOfItems }) => {
      const wrapper = mount(
        <MemoryRouter initialEntries={[entry]}>
          <PageBreadcrumb />
        </MemoryRouter>
      );
      const breadcrumbItems = wrapper.find(".pf-c-breadcrumb__item");
      expect(breadcrumbItems).toHaveLength(numberOfItems);
    }
  );
  it.each`
    entry                               | activeElementIndex
    ${"/lsm/catalog"}                   | ${0}
    ${"/lsm/catalog/service/inventory"} | ${1}
  `(
    "The current element shouldn't be clickable",
    ({ entry, activeElementIndex }) => {
      const wrapper = mount(
        <MemoryRouter initialEntries={[entry]}>
          <PageBreadcrumb />
        </MemoryRouter>
      );
      const breadcrumbItems = wrapper.find(".pf-c-breadcrumb__item");
      expect(
        breadcrumbItems.at(activeElementIndex).hasClass("active")
      ).toBeFalsy();
    }
  );
  it("should change the active element on navigation", () => {
    const history = createMemoryHistory();
    history.push("/");
    const wrapper = mount(
      <Router history={history}>
        <PageBreadcrumb />
      </Router>
    );
    history.push("/lsm/catalog/service/inventory");
    wrapper.update();
    const breadcrumbItems = wrapper.find(".pf-c-breadcrumb__item");
    expect(breadcrumbItems.at(1).hasClass("active")).toBeFalsy();
  });
  it("should keep the env query parameter on navigation", () => {
    const history = createMemoryHistory();
    history.push("/?env=env1");
    const wrapper = mount(
      <Router history={history}>
        <PageBreadcrumb />
      </Router>
    );
    history.push("/lsm/catalog/service/inventory?env=env1");
    wrapper.update();
    const breadcrumbItems = wrapper.find(".pf-c-breadcrumb__item");
    expect(breadcrumbItems.at(0).children().at(0).props().to).toEqual({
      pathname: "/lsm/catalog",
      search: "?env=env1",
    });
  });
});
