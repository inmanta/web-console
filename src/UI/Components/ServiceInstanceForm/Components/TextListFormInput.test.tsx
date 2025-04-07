import React from "react";
import { TextInputTypes } from "@patternfly/react-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { TextListFormInput } from "./TextListFormInput";

describe("TextListInputField", () => {
  const handleClick = jest.fn();

  it("Should render an inputfield with chips when values are preset.", () => {
    render(
      <TextListFormInput
        attributeName="text_list"
        type={TextInputTypes.text}
        attributeValue={["value1", "value2", "value3"]}
        description="a text list input field"
        handleInputChange={handleClick}
        isOptional={false}
      />
    );

    const chips = screen.getAllByRole("listitem");

    expect(chips.length).toBe(3);
  });

  it("Should add an new chip when a new value is added.", async() => {
    render(
      <TextListFormInput
        attributeName="text_list"
        type={TextInputTypes.text}
        attributeValue={["value1", "value2", "value3"]}
        description="a text list input field"
        handleInputChange={handleClick}
        isOptional={false}
      />
    );

    const input = screen.getByRole("textbox");

    await userEvent.type(input, "test");

    const addButton = screen.getByRole("button", { name: "Add" });

    await userEvent.click(addButton);

    const chips = screen.getAllByRole("listitem");

    expect(chips.length).toBe(4);
    expect(handleClick).toHaveBeenCalledWith(["value1", "value2", "value3", "test"], null);
  });

  it("Should remove one chip from the input on delete.", async() => {
    render(
      <TextListFormInput
        attributeName="text_list"
        type={TextInputTypes.text}
        attributeValue={["value1", "value2", "value3"]}
        description="a text list input field"
        handleInputChange={handleClick}
        isOptional={false}
      />
    );

    const deleteButton = screen.getByRole("button", {
      name: /close value1/i,
    });

    await userEvent.click(deleteButton);

    const chips = screen.getAllByRole("listitem");

    expect(chips.length).toBe(2);
    expect(handleClick).toHaveBeenCalledWith(["value2", "value3"], null);
  });

  it("Should remove all chips when the clear button is used.", async() => {
    render(
      <TextListFormInput
        attributeName="text_list"
        type={TextInputTypes.text}
        attributeValue={["value1", "value2", "value3"]}
        description="a text list input field"
        handleInputChange={handleClick}
        isOptional={false}
      />
    );

    const deleteButton = screen.getByRole("button", {
      name: "Clear button and input",
    });

    await userEvent.click(deleteButton);

    const chips = screen.queryAllByRole("listitem");

    expect(chips.length).toBe(0);

    expect(handleClick).toHaveBeenCalledWith([], null);
  });

  it("Should render an inputField with suggestions when suggestions are provided.", () => {
    render(
      <TextListFormInput
        attributeName="text_list"
        type={TextInputTypes.text}
        attributeValue={["value1", "value2", "value3"]}
        description="a text list input field"
        handleInputChange={handleClick}
        isOptional={false}
        suggestions={["apple", "banana", "cherry"]}
      />
    );

    // Open the suggestions popover
    const input = screen.getByRole("textbox");

    fireEvent.focus(input);

    // Check if the values are present
    const firstSuggestion = screen.getByText("apple");

    expect(firstSuggestion).toBeInTheDocument();

    const secondSuggestion = screen.getByText("banana");

    expect(secondSuggestion).toBeInTheDocument();

    const thirdSuggestion = screen.getByText("cherry");

    expect(thirdSuggestion).toBeInTheDocument();
  });
});
