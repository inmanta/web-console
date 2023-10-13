import React from "react";
import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { BooleanToggleInput } from "./BooleanToggleInput";

describe("BooleanFormInput", () => {
  const handleClick = jest.fn();
  it("Should render toggle button input that reponds to the user input", async () => {
    render(
      <BooleanToggleInput
        attributeName="bool_param"
        isChecked={true}
        description={"This is a bool parameter"}
        handleInputChange={handleClick}
      />,
    );
    const toggle = await screen.findByLabelText("Toggle-bool_param");
    await act(async () => {
      await userEvent.click(toggle);
    });
    expect(handleClick).toHaveBeenCalled();
  });
});
