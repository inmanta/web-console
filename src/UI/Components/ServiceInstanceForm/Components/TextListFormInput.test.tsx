import { act } from "react";
import { TextInputTypes } from "@patternfly/react-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { SuggestionValue } from "@/Core";
import { TextListFormInput } from "./TextListFormInput";

describe("TextListInputField", () => {
  const handleClick = vi.fn();

  it("Should render an inputfield with chips when values are preset.", () => {
    render(
      <TextListFormInput
        attributeName="text_list"
        type={TextInputTypes.text}
        attributeValue={["value1", "value2", "value3"]}
        description="a text list input field"
        handleInputChange={handleClick}
      />
    );

    const chips = screen.getAllByRole("listitem");

    expect(chips.length).toBe(3);
  });

  it("Should add an new chip when a new value is added.", async () => {
    render(
      <TextListFormInput
        attributeName="text_list"
        type={TextInputTypes.text}
        attributeValue={["value1", "value2", "value3"]}
        description="a text list input field"
        handleInputChange={handleClick}
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

  it("Should remove one chip from the input on delete.", async () => {
    render(
      <TextListFormInput
        attributeName="text_list"
        type={TextInputTypes.text}
        attributeValue={["value1", "value2", "value3"]}
        description="a text list input field"
        handleInputChange={handleClick}
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

  it("Should remove all chips when the clear button is used.", async () => {
    render(
      <TextListFormInput
        attributeName="text_list"
        type={TextInputTypes.text}
        attributeValue={["value1", "value2", "value3"]}
        description="a text list input field"
        handleInputChange={handleClick}
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

  it("Should show the selected suggestion's label in the input and store its value as a chip.", async () => {
    const handleInputChange = vi.fn();
    const suggestions: SuggestionValue[] = [{ label: "Production network", value: "9f3c1b2a" }];

    render(
      <TextListFormInput
        attributeName="text_list"
        type={TextInputTypes.text}
        attributeValue={[]}
        description="a text list input field"
        handleInputChange={handleInputChange}
        suggestions={suggestions}
      />
    );

    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.focus(input);
    });

    // The dropdown shows the label, not the raw value.
    expect(screen.getByText(suggestions[0].label)).toBeInTheDocument();
    expect(screen.queryByText(suggestions[0].value)).not.toBeInTheDocument();

    // Selecting puts the label into the input...
    await act(async () => {
      fireEvent.click(screen.getByText(suggestions[0].label));
    });
    expect(input).toHaveValue(suggestions[0].label);

    // ...and adding it stores the value, while the chip still shows the label.
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Add" }));
    });

    expect(handleInputChange).toHaveBeenCalledWith([suggestions[0].value], null);

    const chips = screen.getAllByRole("listitem");

    expect(chips).toHaveLength(1);
    expect(chips[0]).toHaveTextContent(suggestions[0].label);
    expect(chips[0]).not.toHaveTextContent(suggestions[0].value);
  });

  it("Should store the value when a typed label exactly matches a suggestion (no list pick).", async () => {
    const handleInputChange = vi.fn();
    const suggestions: SuggestionValue[] = [{ label: "10 Gbps", value: "10000" }];

    render(
      <TextListFormInput
        attributeName="text_list"
        type={TextInputTypes.text}
        attributeValue={[]}
        description="a text list input field"
        handleInputChange={handleInputChange}
        suggestions={suggestions}
      />
    );

    const input = screen.getByRole("textbox");

    await userEvent.type(input, "10 Gbps");
    await userEvent.click(screen.getByRole("button", { name: "Add" }));

    // Typed label links to the value behind it, just like picking it from the list.
    expect(handleInputChange).toHaveBeenCalledWith(["10000"], null);

    const chips = screen.getAllByRole("listitem");

    expect(chips).toHaveLength(1);
    expect(chips[0]).toHaveTextContent("10 Gbps");
  });

  it("Should map stored values back to their labels on load (edit round-trip).", () => {
    const suggestions: SuggestionValue[] = [{ label: "10 Gbps", value: "10000" }];

    render(
      <TextListFormInput
        attributeName="text_list"
        type={TextInputTypes.text}
        attributeValue={["10000"]}
        description="a text list input field"
        handleInputChange={vi.fn()}
        suggestions={suggestions}
      />
    );

    const chips = screen.getAllByRole("listitem");

    expect(chips).toHaveLength(1);
    expect(chips[0]).toHaveTextContent("10 Gbps");
    expect(chips[0]).not.toHaveTextContent("10000");
  });
});
