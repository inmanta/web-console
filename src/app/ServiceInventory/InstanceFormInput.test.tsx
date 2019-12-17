import { mount } from "enzyme";
import { InstanceFormInput } from "./InstanceFormInput";
import React from "react";

describe('Instance Form Input', () => {
  const attributeModels = [
    { name: "name", type: "string", description: "name", modifier: "rw+", default_value_set: true, default_value: "inmanta" },
    { name: "not_editable", type: "string", description: "a non updateable attribute", modifier: "rw", default_value_set: false },
    { name: "bool_param", type: "bool", description: "a boolean attribute", modifier: "rw+", default_value_set: false },
    { name: "db_url", type: "string", description: "url for a database", modifier: "rw+", default_value_set: false },
    { name: "id", type: "number", description: "id of instance", modifier: "rw+", default_value_set: false },
  ];
  const handleInputChange = (value, event) => { return; };
  it('Should render checkbox input for boolean parameters', () => {
    const attributes = { name: "name", not_editable: "", bool_param: '' };
    const wrapper = mount(<InstanceFormInput attributeModels={attributeModels} attributeName="bool_param" attributes={attributes} handleInputChange={handleInputChange} />);
    const checkbox = wrapper.find('.pf-c-check');
    expect(checkbox.getDOMNode()).toBeTruthy();
  });
  it('Should render default text input for string parameters', () => {
    const attributes = { name: "name", not_editable: "", bool_param: '' };
    const wrapper = mount(<InstanceFormInput attributeModels={attributeModels} attributeName="name" attributes={attributes} handleInputChange={handleInputChange} />);
    const textInput = wrapper.find('input[type="text"]');
    expect(textInput.getDOMNode()).toBeTruthy();
  });
  it('Should render url input for if string parameter is a url', () => {
    const attributes = { name: "name", not_editable: "", bool_param: '', db_url: '' };
    const wrapper = mount(<InstanceFormInput attributeModels={attributeModels} attributeName="db_url" attributes={attributes} handleInputChange={handleInputChange} />);
    const urlInput = wrapper.find('input[type="url"]');
    expect(urlInput.getDOMNode()).toBeTruthy();
  });
  it('Should show description if it\'s available', () => {
    const attributes = { name: "name", not_editable: "", bool_param: '', db_url: '' };
    const wrapper = mount(<InstanceFormInput attributeModels={attributeModels} attributeName="db_url" attributes={attributes} handleInputChange={handleInputChange} />);
    const description = wrapper.find('.pf-c-form__helper-text');
    expect(description.text()).toEqual("url for a database");
  });
  it('Should render number input for number parameters', () => {
    const attributes = { name: "name", not_editable: "", bool_param: '', id: '' };
    const wrapper = mount(<InstanceFormInput attributeModels={attributeModels} attributeName="id" attributes={attributes} handleInputChange={handleInputChange} />);
    const textInput = wrapper.find('input[type="number"]');
    expect(textInput.getDOMNode()).toBeTruthy();
  });
});