import React from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
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

  it("Should render radio button input for optional boolean parameters", async () => {
    const mockedFn = jest.fn();
    render(
      <BooleanFormInput
        attributeName="opt_bool_param"
        isChecked={true}
        isOptional={true}
        description={"This is a bool parameter"}
        handleInputChange={(value) => mockedFn(value)}
      />,
    );

    await act(async () => {
      await userEvent.click(await screen.findByTestId("opt_bool_param-false"));
    });
    expect(mockedFn).toHaveBeenCalledWith(false);

    await act(async () => {
      await userEvent.click(await screen.findByTestId("opt_bool_param-none"));
    });
    expect(mockedFn).toHaveBeenCalledWith("null");
  });

  it("Should render radio button input for optional boolean parameters", async () => {
    const mockedFn = jest.fn();
    render(
      <BooleanFormInput
        attributeName="opt_bool_param"
        isChecked={false}
        isOptional={true}
        description={"This is a bool parameter"}
        handleInputChange={(value) => mockedFn(value)}
      />,
    );

    await act(async () => {
      await userEvent.click(await screen.findByTestId("opt_bool_param-true"));
    });
    expect(mockedFn).toHaveBeenCalledWith(true);

    await act(async () => {
      await userEvent.click(await screen.findByTestId("opt_bool_param-none"));
    });
    expect(mockedFn).toHaveBeenCalledWith("null");
  });
});
