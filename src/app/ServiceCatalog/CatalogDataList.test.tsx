import { CatalogDataList } from "./CatalogDataList";
import { shallow, mount } from "enzyme";
import React from "react";
import { DataListItem, DataListAction } from "@patternfly/react-core";
import { MemoryRouter } from "react-router";

describe('Catalog Data List', () => {
  const singleService = [{
    attributes: [],
    description: 'Description of service1',
    environment: 'env',
    lifecycle: { initialState: '', states: [], transfers: [] },
    name: 'service1',
  }];
  const doubleService = [...singleService,
  {
    attributes: [],
    environment: 'env',
    lifecycle: { initialState: '', states: [], transfers: [] },
    name: 'otherService',
  }];
  const serviceCatalogUrl = '/lsm/v1/service_catalog';
  const environmentId = 'env';

  it.each`
  services | numberOfItems
  ${undefined} | ${0}
  ${[]} | ${0}
  ${singleService} | ${1}
  ${doubleService} | ${2}
  `('Given services $services, should render $numberOfItems items', ({ services, numberOfItems }) => {
    const wrapper = shallow(<CatalogDataList services={services} environmentId={environmentId} serviceCatalogUrl={serviceCatalogUrl} />);
    const listItems = wrapper.find(DataListItem);
    expect(listItems).toHaveLength(numberOfItems);
  });

  it('Should render correct links for each service', () => {
    const wrapper = shallow(<CatalogDataList services={doubleService} environmentId={environmentId} serviceCatalogUrl={serviceCatalogUrl} />);
    const listItems = wrapper.find(DataListItem);
    const buttonOfFirstService = listItems.first().find(DataListAction).children().first();
    const buttonOfLastService = listItems.last().find(DataListAction).children().first();
    expect(buttonOfFirstService.props().to).toEqual('/lsm/catalog/service1/inventory');
    expect(buttonOfLastService.props().to).toEqual('/lsm/catalog/otherService/inventory');
  });
  it.each`
  toggles | visibleItems | hiddenItems
  ${[]} | ${[]} | ${['section#service1-expand', 'section#otherService-expand']}
  ${['button#service1-toggle']} | ${['section#service1-expand']} | ${['section#otherService-expand']}
  ${['button#otherService-toggle']} | ${['section#otherService-expand']} | ${['section#service1-expand']}
  ${['button#service1-toggle', 'button#otherService-toggle']} | ${['section#service1-expand', 'section#otherService-expand']} | ${[]}
  `('When clicking on toggles $toggles, should show $visibleItems and hide $hiddenItems', ({ toggles, visibleItems, hiddenItems }) => {
    const wrapper = mount(<MemoryRouter><CatalogDataList services={doubleService} environmentId={environmentId} serviceCatalogUrl={serviceCatalogUrl} /></MemoryRouter>);
    toggles.map(toggle => {
      wrapper.find(toggle).simulate('click');
    });
    visibleItems.map((item: string) => {
      expect(wrapper.find(item).props().hidden).toBeFalsy();
    });
    hiddenItems.map((item: string) => {
      expect(wrapper.find(item).props().hidden).toBeTruthy();
    });
  });
  it('Should hide expandable, when clicked on toggle twice', () => {
    const wrapper = mount(<MemoryRouter><CatalogDataList services={doubleService} environmentId={environmentId} serviceCatalogUrl={serviceCatalogUrl} /></MemoryRouter>);
    wrapper.find('button#service1-toggle').simulate('click');
    wrapper.find('button#service1-toggle').simulate('click');
    expect(wrapper.find('section#service1-expand').props().hidden).toBeTruthy();
  });

  it('Should show description of service entity if it\'s available', () => {
    const wrapper = mount(<MemoryRouter><CatalogDataList services={doubleService} environmentId={environmentId} serviceCatalogUrl={serviceCatalogUrl} /></MemoryRouter>);
    const listItems = wrapper.find(DataListItem);
    const firstDescription = listItems.first().find("#service1-description");
    const lastDescription = listItems.last().find("#otherService-description");
    expect(firstDescription.exists()).toBeTruthy();
    expect(lastDescription.exists()).toBeFalsy();
  });

});