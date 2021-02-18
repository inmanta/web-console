import { mount } from "enzyme";
import React from "react";
import { BooleanFormInput } from "./BooleanFormInput";

describe("BooleanFormInput", () => {
  const handleInputChange = () => {
    return;
  };
  it("Should render radio button input for boolean parameters", () => {
    const wrapper = mount(
      <BooleanFormInput
        attributeName="bool_param"
        isChecked={true}
        isOptional={false}
        description={"This is a bool parameter"}
        handleInputChange={handleInputChange}
      />
    );
    const radioButtons = wrapper.find("input[type='radio']");
    expect(radioButtons.length).toEqual(2);
    expect(radioButtons.at(0).getDOMNode()).toBeTruthy();
  });
  it("Should render radio button input for optional boolean parameters", () => {
    const wrapper = mount(
      <BooleanFormInput
        attributeName="opt_bool_param"
        isChecked={null}
        isOptional={true}
        description={"This is a bool parameter"}
        handleInputChange={handleInputChange}
      />
    );
    const radioButtons = wrapper.find("input[type='radio']");
    expect(radioButtons.length).toEqual(3);
    expect(radioButtons.at(0).getDOMNode()).toBeTruthy();
  });
});
