import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
import { BooleanFormInput } from "./BooleanFormInput";

const InputSetup = ({ attributeName = "bool_param", isOptional = false }) => {
  const [inputState, setInputState] = useState<boolean | null>(false);
  return (
    <BooleanFormInput
      attributeName={attributeName}
      isChecked={inputState}
      isOptional={isOptional}
      description={"This is a bool parameter"}
      handleInputChange={setInputState}
    />
  );
};

describe("BooleanFormInput", () => {
  it("Should render radio button input for boolean parameters", async () => {
    render(<InputSetup />);
    const radioButtons = await screen.findAllByRole("radio");
    expect(radioButtons.length).toEqual(2);
  });

  it("Should render radio button input for optional boolean parameters", async () => {
    render(<InputSetup isOptional />);
    const radioButtons = await screen.findAllByRole("radio");
    expect(radioButtons.length).toEqual(3);
  });

  it("Should render radio button input for optional boolean parameters", async () => {
    render(<InputSetup attributeName="opt_bool_param" isOptional />);

    expect(await screen.findByTestId("opt_bool_param-false")).toBeChecked();

    await act(async () => {
      await userEvent.click(await screen.findByTestId("opt_bool_param-true"));
    });
    expect(await screen.findByTestId("opt_bool_param-true")).toBeChecked();

    await act(async () => {
      await userEvent.click(await screen.findByTestId("opt_bool_param-none"));
    });
    expect(await screen.findByTestId("opt_bool_param-none")).toBeChecked();

    await act(async () => {
      await userEvent.click(await screen.findByTestId("opt_bool_param-false"));
    });
    expect(await screen.findByTestId("opt_bool_param-false")).toBeChecked();
  });
});
