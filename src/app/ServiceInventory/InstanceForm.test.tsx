import { InstanceForm, extractInitialAttributes, getChangedAttributesOnly } from "./InstanceForm";
import React from "react";
import { mount } from "enzyme";
import { IRequestParams } from "@app/utils/fetchInmantaApi";

describe('Instance Form component', () => {
  const attributes = [
    { name: "name", type: "string", description: "name", modifier: "rw+", default_value_set: true, default_value: "inmanta" },
    { name: "not_editable", type: "string", description: "a non updateable attribute", modifier: "rw", default_value_set: false },
    { name: "bool_param", type: "bool", description: "a boolean attribute", modifier: "rw+", default_value_set: false }
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
  });
  describe('Update form', () => {
    const originalAttributes = { name: "inmanta", not_editable: "default", bool_param: true };
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
  });

  describe('Sets initial attributes correctly', () => {
    it('With no previous values', () => {
      const initialAttributes = extractInitialAttributes(attributes);
      expect(initialAttributes).toEqual({ name: "inmanta", not_editable: "", bool_param: "" });
    });
    it('With previous values', () => {
      const originalAttributes = { name: "inmanta", bool_param: true };
      const initialAttributes = extractInitialAttributes(attributes, originalAttributes);
      expect(initialAttributes).toEqual({ name: "inmanta", not_editable: "", bool_param: true });
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
  });

});