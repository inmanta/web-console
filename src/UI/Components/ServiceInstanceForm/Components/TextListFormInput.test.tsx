import React from "react";
import { TextInputTypes } from "@patternfly/react-core";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TextListFormInput } from "./TextListFormInput";

describe("TextListInputField", () => {
  const handleClick = jest.fn();

  it("Should render an inputfield with chips when values are preset.", () => {
    const { container } = render(
      <TextListFormInput
        attributeName="text_list"
        type={TextInputTypes.text}
        attributeValue={["value1", "value2", "value3"]}
        description="a text list input field"
        handleInputChange={handleClick}
        isOptional={false}
      />,
    );

    const chips = container.getElementsByClassName(
      "pf-c-chip-group__list-item",
    );
    expect(chips.length).toBe(3);
  });

  it("Should add an new chip when a new value is added.", async () => {
    const { container } = render(
      <TextListFormInput
        attributeName="text_list"
        type={TextInputTypes.text}
        attributeValue={["value1", "value2", "value3"]}
        description="a text list input field"
        handleInputChange={handleClick}
        isOptional={false}
      />,
    );

    await act(async () => {
      const input = screen.getByRole("textbox");
      await userEvent.type(input, "test");

      const addButton = screen.getByRole("button", { name: "Add" });
      await userEvent.click(addButton);
    });

    const chips = container.getElementsByClassName(
      "pf-c-chip-group__list-item",
    );
    expect(chips.length).toBe(4);
    expect(handleClick).toHaveBeenCalledWith(
      ["value1", "value2", "value3", "test"],
      null,
    );
  });

  it("Should remove one chip from the input on delete.", async () => {
    const { container } = render(
      <TextListFormInput
        attributeName="text_list"
        type={TextInputTypes.text}
        attributeValue={["value1", "value2", "value3"]}
        description="a text list input field"
        handleInputChange={handleClick}
        isOptional={false}
      />,
    );

    await act(async () => {
      const deleteButton = screen.getByRole("button", { name: "close value1" });
      await userEvent.click(deleteButton);
    });

    const chips = container.getElementsByClassName(
      "pf-c-chip-group__list-item",
    );
    expect(chips.length).toBe(2);
    expect(handleClick).toHaveBeenCalledWith(["value2", "value3"], null);

    const chipsContainer = container.getElementsByClassName(
      "pf-c-text-input-group__main",
    );
    expect(chipsContainer[0].childElementCount).toBe(2);
  });

  it("Should remove all chips when the clear button is used.", async () => {
    const { container } = render(
      <TextListFormInput
        attributeName="text_list"
        type={TextInputTypes.text}
        attributeValue={["value1", "value2", "value3"]}
        description="a text list input field"
        handleInputChange={handleClick}
        isOptional={false}
      />,
    );

    await act(async () => {
      const deleteButton = screen.getByRole("button", {
        name: "Clear button and input",
      });
      await userEvent.click(deleteButton);
    });

    const chipsContainer = container.getElementsByClassName(
      "pf-c-text-input-group__main",
    );
    expect(chipsContainer[0].childElementCount).toBe(1);
    expect(chipsContainer[0].firstChild).toHaveClass(
      "pf-c-text-input-group__text",
    );
    expect(handleClick).toHaveBeenCalledWith([], null);
  });
});
