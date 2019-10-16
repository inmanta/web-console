import { AttributeTable } from "./AttributeTable";
import React from "react";
import { mount } from "enzyme";

describe('Attribute Table ', () => {
  it.each`
  attributes | numberOfCells
  ${[]} | ${0}
  ${[{name: "name", type: "type", description: "desc", modifier: "modifier"}]} | ${4}
  `('Given attributes $attributes, should show $numberOfCells cells', ({attributes, numberOfCells}) => {
    const wrapper = mount(<AttributeTable attributes={attributes}/>);
    const cells =  wrapper.find('td');
    expect(cells).toHaveLength(numberOfCells);
  });

  it.each`
  attributes | showNotFoundMessage
  ${[]} | ${true}
  ${[{name: "name", type: "type", description: "desc", modifier: "modifier"}]} | ${false}
  `('Given attributes $attributes, should show/hide ($showNotFoundMessage) not found message ', ({attributes, showNotFoundMessage})=> {
    const wrapper = mount(<AttributeTable attributes={attributes}/>);
    const noItemsFound = wrapper.find('#no-attributes');
    expect(noItemsFound.exists()).toBe(showNotFoundMessage);
  });

});