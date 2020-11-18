import { InstanceForm, extractInitialAttributes, getChangedAttributesOnly, ensureAttributeType } from "./InstanceForm";
import React from "react";
import { mount } from "enzyme";
import { IRequestParams } from "@app/utils/fetchInmantaApi";

describe('Instance Form component', () => {
  const attributes = [
    { name: "name", type: "string", description: "name", modifier: "rw+", default_value_set: true, default_value: "inmanta" },
    { name: "not_editable", type: "string", description: "a non updateable attribute", modifier: "rw", default_value_set: false },
    { name: "bool_param", type: "bool", description: "a boolean attribute", modifier: "rw+", default_value_set: false },
    { name: "opt_int", type: "int?", description: "an optional int", modifier: "rw+", default_value_set: false }
  ];
  const requestParams: IRequestParams = { isEnvironmentIdRequired: true, environmentId: "envId1", urlEndpoint: "api/instance", setErrorMessage: () => { return; } };
  describe('Create form', () => {
    it('Calls post on instance url when submitted', () => {
      const wrapper = mount(<InstanceForm attributeModels={attributes} requestParams={requestParams} />);
      const button = wrapper.find(".pf-c-button.pf-m-primary");
      button.simulate('click');
      expect(fetchMock.mock.calls).toHaveLength(1);
      expect(fetchMock.mock.calls[0][1].method).toEqual("POST");
    });
    it('Doesn\'t post when cancelled', () => {
      const wrapper = mount(<InstanceForm attributeModels={attributes} requestParams={requestParams} />);
      const button = wrapper.find(".pf-c-button.pf-m-secondary");
      button.simulate('click');
      expect(fetchMock.mock.calls).toHaveLength(0);
    });
    it('Calls create correctly when not setting optional attribute', () => {
      const wrapper = mount(<InstanceForm attributeModels={attributes} requestParams={requestParams} />);
      const notEditableField = wrapper.find("#not_editable");
      notEditableField.at(0).getDOMNode<HTMLInputElement>().value = "Something";
      notEditableField.at(0).simulate('change', { target: { id: "not_editable" } });
      const boolField = wrapper.find('input[type=\'checkbox\']');
      boolField.at(0).getDOMNode<HTMLInputElement>().checked = true;
      boolField.at(0).simulate('change', { target: { id: "bool_param" } });
      const button = wrapper.find(".pf-c-button.pf-m-primary");
      button.simulate('click');
      expect(fetchMock.mock.calls).toHaveLength(1);
      const requestAttributes = JSON.parse(fetchMock.mock.calls[0][1].body).attributes;
      expect(requestAttributes.not_editable).toEqual("Something");
      expect(requestAttributes.bool_param).toBeTruthy();
      expect(requestAttributes.opt_int).toBeUndefined();
      expect(fetchMock.mock.calls[0][1].method).toEqual("POST");
    });
  });
  describe('Update form', () => {
    const originalAttributes = { name: "inmanta", not_editable: "default", bool_param: true, opt_int: 42 };
    it('Calls patch on instance url when submitted', () => {
      const wrapper = mount(<InstanceForm attributeModels={attributes} requestParams={requestParams} originalAttributes={originalAttributes} update={true} />);
      const button = wrapper.find(".pf-c-button.pf-m-primary");
      button.simulate('click');
      expect(fetchMock.mock.calls).toHaveLength(1);
      expect(fetchMock.mock.calls[0][1].method).toEqual("PATCH");
    });
    it('Doesn\'t make api call when cancelled', () => {
      const wrapper = mount(<InstanceForm attributeModels={attributes} requestParams={requestParams} originalAttributes={originalAttributes} update={true} />);
      const button = wrapper.find(".pf-c-button.pf-m-secondary");
      button.simulate('click');
      expect(fetchMock.mock.calls).toHaveLength(0);
    });
    it('Calls patch even if no original attributes were set', () => {
      const wrapper = mount(<InstanceForm attributeModels={attributes} requestParams={requestParams} update={true} />);
      const button = wrapper.find(".pf-c-button.pf-m-primary");
      button.simulate('click');
      expect(fetchMock.mock.calls).toHaveLength(1);
      expect(fetchMock.mock.calls[0][1].method).toEqual("PATCH");
    });
    it('Shows info message when no attributes can be updated', () => {
      const wrapper = mount(<InstanceForm attributeModels={[]} requestParams={requestParams} originalAttributes={{}} update={true} />);
      const alert = wrapper.find(".pf-c-alert__title");
      expect(alert.getDOMNode()).toBeTruthy();
    });
    it('Calls patch correctly when updating optional attribute to null', () => {
      const wrapper = mount(<InstanceForm attributeModels={attributes} requestParams={requestParams} originalAttributes={originalAttributes} update={true} />);
      const numField = wrapper.find("#opt_int");
      numField.at(0).getDOMNode<HTMLInputElement>().value = "";
      numField.at(0).simulate('change', { target: { id: "opt_int" } });
      const button = wrapper.find(".pf-c-button.pf-m-primary");
      button.simulate('click');
      expect(fetchMock.mock.calls).toHaveLength(1);
      expect(JSON.parse(fetchMock.mock.calls[0][1].body).attributes.opt_int).toBeNull();
      expect(fetchMock.mock.calls[0][1].method).toEqual("PATCH");
    });
  });

  describe('Sets initial attributes correctly', () => {
    it('With no previous values', () => {
      const initialAttributes = extractInitialAttributes(attributes);
      expect(initialAttributes).toEqual({ name: "inmanta", not_editable: "", bool_param: "", opt_int: "" });
    });
    it('With previous values', () => {
      const originalAttributes = { name: "inmanta", bool_param: true };
      const initialAttributes = extractInitialAttributes(attributes, originalAttributes);
      expect(initialAttributes).toEqual({ name: "inmanta", not_editable: "", bool_param: true, opt_int: "" });
    });
  });
  describe('Extracts updated values correctly', () => {
    it('With a single difference', () => {
      const originalAttributes = { name: "inmanta", bool_param: false };
      const afterChanges = { name: "inmanta", bool_param: true };
      const diff = getChangedAttributesOnly(afterChanges, originalAttributes);
      expect(diff).toEqual({ bool_param: true });
    });
    it('With no difference', () => {
      const originalAttributes = { name: "inmanta", bool_param: true };
      const afterChanges = { name: "inmanta", bool_param: true };
      const diff = getChangedAttributesOnly(afterChanges, originalAttributes);
      expect(diff).toEqual({});
    });
    it('With multiple differences', () => {
      const originalAttributes = { name: "inmanta", bool_param: true, another_attribute: "same" };
      const afterChanges = { name: "inmanta2", bool_param: false, another_attribute: "same" };
      const diff = getChangedAttributesOnly(afterChanges, originalAttributes);
      expect(diff).toEqual({ name: "inmanta2", bool_param: false });
    });
    it('With no original values to compare to', () => {
      const originalAttributes = {};
      const afterChanges = { name: "inmanta2", bool_param: false, another_attribute: "same" };
      const diff = getChangedAttributesOnly(afterChanges, originalAttributes);
      expect(diff).toEqual(afterChanges);
    });
    it('Changing from undefined to null', () => {
      const originalAttributes = { name: "inmanta", bool_param: true };
      const afterChanges = { name: "inmanta", bool_param: false, another_attribute: null };
      const diff = getChangedAttributesOnly(afterChanges, originalAttributes);
      expect(diff).toEqual({ bool_param: false });
    });
    it('Changing from another value to null', () => {
      const originalAttributes = { name: "inmanta", bool_param: true, another_attribute: "same" };
      const afterChanges = { name: "inmanta2", bool_param: true, another_attribute: null };
      const diff = getChangedAttributesOnly(afterChanges, originalAttributes);
      expect(diff).toEqual({ name: "inmanta2", another_attribute: null });
    });
  });
  describe('Converts attributes to proper types before submitting request', () => {
    const attributeModels = [
      { name: "number", type: "number", description: "name", modifier: "rw+", default_value_set: true, default_value: "inmanta" },
      { name: "array", type: "string[]", description: "an array attribute", modifier: "rw+", default_value_set: false },
      { name: "dict_param", type: "dict", description: "a dict attribute", modifier: "rw+", default_value_set: false },
      { name: "int_param", type: "int?", description: "an optional integer", modifier: "rw+", default_value_set: false },
      { name: "bool_param", type: "bool?", description: "an optional bool", modifier: "rw+", default_value_set: false },
    ];
    it('When the parameter is a valid number', () => {
      const value = ensureAttributeType(attributeModels, "number", "5");
      expect(value).toEqual(5);
    });
    it('When the parameter is an invalid number', () => {
      const value = ensureAttributeType(attributeModels, "number", "5oooo");
      expect(value).toBeNaN();
    });
    it('When the parameter is a valid dict', () => {
      const value = ensureAttributeType(attributeModels, "dict_param", "{\"key\": \"val\"}");
      expect(value).toEqual({ key: "val" });
    });
    it('When the parameter is an invalid dict', () => {
      const value = ensureAttributeType(attributeModels, "dict_param", "{\"key: \"val\"}");
      expect(value).toEqual("{\"key: \"val\"}");
    });
    it('When the parameter is a valid array', () => {
      const value = ensureAttributeType(attributeModels, "array", "first, ");
      expect(value).toEqual(["first", ""]);
    });
    it('When the parameter is a valid (empty) array', () => {
      const value = ensureAttributeType(attributeModels, "array", "");
      expect(value).toEqual([""]);
    });
    it('When the parameter is empty for an optional number', () => {
      const value = ensureAttributeType(attributeModels, "int_param", "");
      expect(value).toBeNull();
    });
    it('When the parameter is valid for an optional number', () => {
      const value = ensureAttributeType(attributeModels, "int_param", "10");
      expect(value).toEqual(10);
    });
  });

});