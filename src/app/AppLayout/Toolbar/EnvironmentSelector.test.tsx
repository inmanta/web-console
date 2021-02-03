import { EnvironmentSelector } from "./EnvironmentSelector";
import { mount } from "enzyme";
import React from "react";
import { StoreProvider, createStore } from "easy-peasy";
import { storeModel } from "@/UI/Store";
import { getEnvironmentNamesWithSeparator } from "../AppLayout";
import _ from "lodash";

describe("Environment Selector", () => {
  it("should show default value when there are no environments", () => {
    const envSelector = (
      <StoreProvider store={createStore(storeModel)}>
        <EnvironmentSelector items={[]} />
      </StoreProvider>
    );
    const wrapper = mount(envSelector);
    const selectorToggle = wrapper.find(".pf-c-context-selector__toggle");
    expect(selectorToggle.text()).toEqual("undefined / undefined");
  });
  describe("with empty store", () => {
    let envSelector;
    let wrapper;
    let selectorToggle;
    let selectorListItem;
    beforeEach(() => {
      envSelector = (
        <StoreProvider store={createStore(storeModel)}>
          <EnvironmentSelector
            items={[
              {
                displayName: "test-project / test-environment",
                projectId: "projectId1",
                environmentId: "environmentId1",
              },
            ]}
          />
        </StoreProvider>
      );
      wrapper = mount(envSelector);
      selectorToggle = wrapper.find(".pf-c-context-selector__toggle");
      selectorToggle.simulate("click");
      selectorListItem = wrapper.find(".pf-c-context-selector__menu-list-item");
    });

    it("should show environment when passed as prop", () => {
      expect(selectorListItem.text()).toEqual(
        "test-project / test-environment"
      );
    });
    it("should close environment selector list when clicked on an item", () => {
      selectorListItem.simulate("click");
      selectorListItem = wrapper.find(".pf-c-context-selector__menu-list-item");
      expect(selectorListItem.exists()).toBeFalsy();
    });
  });
  const projects = [
    {
      environments: [
        {
          id: "env-id",
          name: "test-environment",
          projectId: "project-id",
        },
      ],
      id: "project-id",
      name: "test-project",
    },
    {
      environments: [
        {
          id: "env-id2",
          name: "test-environment2",
          projectId: "project-id2",
        },
      ],
      id: "project-id2",
      name: "test-project2",
    },
    {
      environments: [
        {
          id: "env-id3",
          name: "test-environment",
          projectId: "project-id2",
        },
      ],
      id: "project-id2",
      name: "test-project2",
    },
    {
      environments: [
        {
          id: "env-id4",
          name: "test-environment4",
          projectId: "project-id4",
        },
      ],
      id: "project-id4",
      name: "test-project4",
    },
    {
      environments: [
        {
          id: "dummy-env-id",
          name: "dummy-environment",
          projectId: "dummy-project-id",
        },
      ],
      id: "dummy-project-id",
      name: "dummy-project",
    },
  ];
  describe("with a populated store", () => {
    let envSelector;
    let wrapper;
    let selectorToggle;
    beforeEach(() => {
      const storeInstance = createStore(storeModel);
      storeInstance.dispatch.fetched(projects);
      const environments = _.flatMap(projects, (project) =>
        getEnvironmentNamesWithSeparator(project)
      );
      envSelector = (
        <StoreProvider store={storeInstance}>
          <EnvironmentSelector items={environments} />
        </StoreProvider>
      );
      wrapper = mount(envSelector);
      selectorToggle = wrapper.find(".pf-c-context-selector__toggle");
    });
    it("should select an environment by default", () => {
      expect(selectorToggle.text()).toEqual("test-project / test-environment");
    });
    it("should change selected environment when clicked on item", () => {
      selectorToggle.simulate("click");
      const selectorListItems = wrapper.find(
        ".pf-c-context-selector__menu-list-item"
      );
      selectorListItems.at(1).simulate("click");
      expect(selectorToggle.text()).toEqual(
        "test-project2 / test-environment2"
      );
    });
    it.each`
      inputValue | numberOfMatchedItems
      ${"test"}  | ${4}
      ${"4"}     | ${1}
      ${"abcd"}  | ${0}
    `(
      "should filter number of results to $numberOfMatchedItems when the filter input is $inputValue",
      ({ inputValue, numberOfMatchedItems }) => {
        selectorToggle.simulate("click");
        const searchTextInput = wrapper.find("input[type='search']").first();
        searchTextInput.getDOMNode().setAttribute("value", inputValue);
        searchTextInput.simulate("change");
        const selectorListItems = wrapper.find(
          ".pf-c-context-selector__menu-list-item"
        );
        expect(selectorListItems).toHaveLength(numberOfMatchedItems);
      }
    );
  });
  it("should select the proper environment when multiple environments have the same name", () => {
    const storeInstance = createStore(storeModel);
    storeInstance.dispatch.fetched(projects);
    const environments = _.flatMap(projects, (project) =>
      getEnvironmentNamesWithSeparator(project)
    );
    const envSelector = (
      <StoreProvider store={storeInstance}>
        <EnvironmentSelector items={environments} />
      </StoreProvider>
    );
    const wrapper = mount(envSelector);
    const selectorToggle = wrapper.find(".pf-c-context-selector__toggle");

    selectorToggle.simulate("click");
    const selectorListItems = wrapper.find(
      ".pf-c-context-selector__menu-list-item"
    );
    selectorListItems.at(2).simulate("click");
    expect(selectorToggle.text()).toEqual("test-project2 / test-environment");
    expect(storeInstance.getState().projects.getSelectedProject.id).toEqual(
      "project-id2"
    );
    expect(
      storeInstance.getState().environments.getSelectedEnvironment.id
    ).toEqual("env-id3");
    expect(location.search).toEqual("?env=env-id3");
  });
  describe("with a populated store", () => {
    let envSelector;
    let wrapper;
    let selectorToggle;
    beforeEach(() => {
      const storeInstance = createStore(storeModel);
      const params = new URLSearchParams(location.search);
      params.set("env", "env-id2");
      window.history.replaceState({}, "", `${location.pathname}?${params}`);
      storeInstance.dispatch.fetched(projects);
      const environments = _.flatMap(projects, (project) =>
        getEnvironmentNamesWithSeparator(project)
      );
      envSelector = (
        <StoreProvider store={storeInstance}>
          <EnvironmentSelector items={environments} />
        </StoreProvider>
      );
      wrapper = mount(envSelector);
      selectorToggle = wrapper.find(".pf-c-context-selector__toggle");
    });
    it("should select an environment if query param is specified", () => {
      expect(selectorToggle.text()).toEqual(
        "test-project2 / test-environment2"
      );
    });
    afterEach(() => {
      window.history.replaceState({}, "", `${location.pathname}`);
    });
  });
});
