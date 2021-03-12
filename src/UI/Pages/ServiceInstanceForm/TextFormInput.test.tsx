import { TextInputTypes } from "@patternfly/react-core";
import { mount } from "enzyme";
import React from "react";
import { TextFormInput } from "./TextFormInput";

describe("TextFormInput", () => {
  const handleInputChange = () => {
    return;
  };
  it("Should render default text input for string parameters", () => {
    const wrapper = mount(
      <TextFormInput
        isOptional={false}
        attributeName="name"
        attributeValue=""
        description="Description of attribute"
        type={TextInputTypes.text}
        handleInputChange={handleInputChange}
      />
    );
    const textInput = wrapper.find('input[type="text"]');
    expect(textInput.getDOMNode()).toBeTruthy();
  });
  it("Should render url input, if string parameter is a url", () => {
    const wrapper = mount(
      <TextFormInput
        isOptional={false}
        attributeName="name"
        attributeValue=""
        type={TextInputTypes.url}
        handleInputChange={handleInputChange}
      />
    );
    const urlInput = wrapper.find('input[type="url"]');
    expect(urlInput.getDOMNode()).toBeTruthy();
  });
  it("Should show description, if it's available", () => {
    const wrapper = mount(
      <TextFormInput
        isOptional={false}
        attributeName="name"
        attributeValue=""
        description="Description of attribute"
        type={TextInputTypes.url}
        handleInputChange={handleInputChange}
      />
    );
    const description = wrapper.find(".pf-c-form__helper-text");
    expect(description.text()).toEqual("Description of attribute");
  });
  it("Should render number input for number parameters", () => {
    const wrapper = mount(
      <TextFormInput
        isOptional={false}
        attributeName="name"
        attributeValue=""
        description="Description of attribute"
        type={TextInputTypes.number}
        handleInputChange={handleInputChange}
      />
    );
    const textInput = wrapper.find('input[type="number"]');
    expect(textInput.getDOMNode()).toBeTruthy();
  });
  it("Should render number input, even if parameter is optional", () => {
    const wrapper = mount(
      <TextFormInput
        isOptional={true}
        attributeName="name"
        attributeValue=""
        description="Description of attribute"
        type={TextInputTypes.number}
        handleInputChange={handleInputChange}
      />
    );
    const numberInput = wrapper.find('input[type="number"]');
    expect(numberInput.getDOMNode()).toBeTruthy();
  });
});
