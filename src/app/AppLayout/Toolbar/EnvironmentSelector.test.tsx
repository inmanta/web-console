import { EnvironmentSelector } from "./EnvironmentSelector";
import { mount } from "enzyme";
import React from "react";
import { StoreProvider, createStore } from "easy-peasy";
import { storeModel } from "@app/Models/CoreModels";

describe('Environment Selector', () => {
  it('should show default value when there are no environments', () => {
    const envSelector = <StoreProvider store={createStore(storeModel)}><EnvironmentSelector items={[]} /></StoreProvider>
    const wrapper = mount(envSelector);
    const selectorToggle = wrapper.find(".pf-c-context-selector__toggle");
    expect(selectorToggle.text()).toEqual("undefined / undefined");
  });
  describe('with empty store', () => {
    let envSelector;
    let wrapper;
    let selectorToggle;
    let selectorListItem;
    beforeEach(() => {
      envSelector = <StoreProvider store={createStore(storeModel)}><EnvironmentSelector items={['test-project / test-environment']} /></StoreProvider>
      wrapper = mount(envSelector);
      selectorToggle = wrapper.find(".pf-c-context-selector__toggle");
      selectorToggle.simulate('click');
      selectorListItem = wrapper.find('.pf-c-context-selector__menu-list-item');
    });

    it('should show environment when passed as prop', () => {
      expect(selectorListItem.text()).toEqual("test-project / test-environment");
    });
    it('should close environment selector list when clicked on an item', () => {
      selectorListItem.simulate('click');
      selectorListItem = wrapper.find('.pf-c-context-selector__menu-list-item');
      expect(selectorListItem.exists()).toBeFalsy();
    });
  });
  describe('with a populated store', () => {
    let envSelector;
    let wrapper;
    let selectorToggle;
    beforeEach(() => {
      const storeInstance = createStore(storeModel);
      storeInstance.dispatch.projects.fetched([{
        environments: [
          {
            id: 'env-id',
            name: 'test-environment',
            projectId: 'project-id',
          }
        ],
        id: 'project-id',
        name: 'test-project',
      },
      {
        environments: [
          {
            id: 'env-id2',
            name: 'test-environment2',
            projectId: 'project-id2',
          }
        ],
        id: 'project-id2',
        name: 'test-project2',
      },
      {
        environments: [
          {
            id: 'dummy-env-id',
            name: 'dummy-environment',
            projectId: 'dummy-project-id',
          }
        ],
        id: 'dummy-project-id',
        name: 'dummy-project',
      }]);
      envSelector = <StoreProvider store={storeInstance}><EnvironmentSelector items={['test-project / test-environment', 'test-project2 / test-environment2']} /></StoreProvider>
      wrapper = mount(envSelector);
      selectorToggle = wrapper.find(".pf-c-context-selector__toggle");
    });
    it('should select an environment by default', () => {
      expect(selectorToggle.text()).toEqual("test-project / test-environment");
    });
    it('should change selected environment when clicked on item', () => {
      selectorToggle.simulate('click');
      const selectorListItems = wrapper.find('.pf-c-context-selector__menu-list-item');
      selectorListItems.at(1).simulate('click');
      expect(selectorToggle.text()).toEqual('test-project2 / test-environment2');
    });
    it.each`
    inputValue | numberOfMatchedItems
    ${'test'} | ${2}
    ${'2'} | ${1}
    ${'abcd'} | ${0}
    `('should filter number of results to $numberOfMatchedItems when the filter input is $inputValue', ({ inputValue, numberOfMatchedItems }) => {
      selectorToggle.simulate('click');
      const searchTextInput = wrapper.find('input[type=\'search\']').first();
      searchTextInput.getDOMNode().setAttribute('value', inputValue);
      searchTextInput.simulate('change');
      const selectorListItems = wrapper.find('.pf-c-context-selector__menu-list-item');
      expect(selectorListItems).toHaveLength(numberOfMatchedItems);
    });


  });
});