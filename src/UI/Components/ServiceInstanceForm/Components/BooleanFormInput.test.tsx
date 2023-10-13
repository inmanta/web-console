import React from "react";
import { render, screen } from "@testing-library/react";
import { BooleanFormInput } from "./BooleanFormInput";

describe("BooleanFormInput", () => {
  const handleInputChange = () => {
    return;
  };
  it("Should render radio button input for boolean parameters", async () => {
    render(
      <BooleanFormInput
        attributeName="bool_param"
        isChecked={true}
        isOptional={false}
        description={"This is a bool parameter"}
        handleInputChange={handleInputChange}
      />,
    );
    const radioButtons = await screen.findAllByRole("radio");
    expect(radioButtons.length).toEqual(2);
  });
  it("Should render radio button input for optional boolean parameters", async () => {
    render(
      <BooleanFormInput
        attributeName="opt_bool_param"
        isChecked={null}
        isOptional={true}
        description={"This is a bool parameter"}
        handleInputChange={handleInputChange}
      />,
    );
    const radioButtons = await screen.findAllByRole("radio");
    expect(radioButtons.length).toEqual(3);
  });
});
