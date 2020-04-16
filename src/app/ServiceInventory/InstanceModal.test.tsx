import { InstanceModal, ButtonType, getEditableAttributes, getNotReadonlyAttributes } from "./InstanceModal";
import React from "react";
import { mount } from "enzyme";
import { InventoryContext } from "./ServiceInventory";

describe('Instance Modal ', () => {
  const attributes = [
    { name: "name", type: "string", "description": "name", modifier: "rw+", "default_value_set": false },
    { name: "not_editable", type: "string", "description": "a non updateable attribute", modifier: "rw", "default_value_set": false },
    { name: "read_only", type: "string", "description": "a read-only", modifier: "r", "default_value_set": false }
  ];
  const dummyFunction = () => { return; };

  const serviceInstanceModel = {
    active_attributes: { name: "attribute1" },
    callback: [],
    candidate_attributes: {},
    deleted: false,
    environment: "envId1",
    id: "instance1",
    last_updated: "",
    rollback_attributes: {},
    service_entity: "test_service",
    state: "up",
    version: 3,
  };
  it.each`
  buttonType | text
  ${"ADD"} | ${"Add instance"}
  ${"EDIT"} | ${"Edit"}
  ${"DELETE"} | ${"Delete"}
  `('Given buttonType $buttonType, should render button with text $text', ({ buttonType, text }) => {
    const wrapper = mount(<InstanceModal buttonType={buttonType} serviceName="test_service" />);
    const button = wrapper.find('button');
    expect(button.text()).toContain(text);
  });

  it('Prepares add instance form', () => {
    const wrapper = mount(
      <InventoryContext.Provider value={{ attributes, environmentId: "envId1", "inventoryUrl": 'api/endpoint', setErrorMessage: dummyFunction }}>
        <InstanceModal buttonType={ButtonType.add} serviceName="test_service" />
      </InventoryContext.Provider>);
    const button = wrapper.find('button');
    button.simulate('click');
    const title = wrapper.find('.pf-c-title');
    const modalHeader = wrapper.find('.pf-c-modal-box__body');
    expect(title.text()).toContain('Create instance');
    expect(modalHeader.text()).toContain("test_service");
  });

  it('Prepares edit instance form', () => {
    const wrapper = mount(
      <InventoryContext.Provider value={{ attributes, environmentId: "envId1", "inventoryUrl": 'api/endpoint', setErrorMessage:dummyFunction }}>
        <InstanceModal buttonType={ButtonType.edit} serviceName="test_service" instance={serviceInstanceModel} />
      </InventoryContext.Provider>);
    const button = wrapper.find('button');
    button.simulate('click');
    const title = wrapper.find('.pf-c-title');
    const modalHeader = wrapper.find('.pf-c-modal-box__body');
    expect(title.text()).toContain('Edit instance');
    expect(modalHeader.text()).toContain("instance1");
  });

  it('Prepares delete instance form', () => {
    const wrapper = mount(
      <InventoryContext.Provider value={{ attributes, environmentId: "envId1", "inventoryUrl": 'api/endpoint', setErrorMessage: dummyFunction }}>
        <InstanceModal buttonType={ButtonType.delete} serviceName="test_service" instance={serviceInstanceModel} />
      </InventoryContext.Provider>);
    const button = wrapper.find('button');
    button.simulate('click');
    const title = wrapper.find('.pf-c-title');
    const modalHeader = wrapper.find('.pf-c-modal-box__body');
    expect(title.text()).toContain('Delete instance');
    expect(modalHeader.text()).toContain("delete instance instance1 of service entity test_service");
  });

  it('Filters editable attributes', () => {
    const editable = getEditableAttributes(attributes);
    expect(editable).toHaveLength(1);
  })
  it('Filters not-readonly attributes', () => {
    const editable = getNotReadonlyAttributes(attributes);
    expect(editable).toHaveLength(2);
  })

});