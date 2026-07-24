import { act, useState } from "react";
import { TextInputTypes } from "@patternfly/react-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { SuggestionValue } from "@/Core";
import { TextFormInput } from "./TextFormInput";

describe("TextFormInput", () => {
  const setup = (
    suggestions: SuggestionValue[],
    { attributeValue = "", handleInputChange = vi.fn(), type = TextInputTypes.text } = {}
  ) => {
    render(
      <TextFormInput
        attributeName="text_field"
        attributeValue={attributeValue}
        description="a text input field"
        isOptional
        type={type}
        handleInputChange={handleInputChange}
        suggestions={suggestions}
      />
    );

    return { handleInputChange };
  };

  it("displays the label but submits the value when a suggestion is selected", async () => {
    const suggestions: SuggestionValue[] = [{ label: "10 Gbps", value: "10000" }];
    const { handleInputChange } = setup(suggestions);

    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.focus(input);
    });

    await act(async () => {
      fireEvent.click(screen.getByText(suggestions[0].label));
    });

    // The field shows the human-friendly label...
    expect(input).toHaveValue(suggestions[0].label);
    // ...while the value is what gets submitted.
    expect(handleInputChange).toHaveBeenCalledWith(suggestions[0].value, null);
  });

  it("submits a plain string suggestion unchanged (label === value)", async () => {
    const suggestions: SuggestionValue[] = [{ label: "apple", value: "apple" }];
    const { handleInputChange } = setup(suggestions);

    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.focus(input);
    });

    await act(async () => {
      fireEvent.click(screen.getByText(suggestions[0].label));
    });

    expect(input).toHaveValue("apple");
    expect(handleInputChange).toHaveBeenCalledWith("apple", null);
  });

  it("submits the value when typed text exactly matches a suggestion label", async () => {
    const suggestions: SuggestionValue[] = [{ label: "10 Gbps", value: "10000" }];
    const { handleInputChange } = setup(suggestions);

    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "10 Gbps" } });
    });

    // Typing the label exactly links to the value behind it, without picking from the list.
    expect(input).toHaveValue("10 Gbps");
    expect(handleInputChange).toHaveBeenCalledWith("10000", null);
  });

  it("shows the typed value while editing and resolves it to the label on blur", async () => {
    const suggestions: SuggestionValue[] = [{ label: "10 Gbps", value: "10000" }];

    // Feeds the submitted value back as attributeValue, like the real form does.
    const Controlled = () => {
      const [value, setValue] = useState("");

      return (
        <TextFormInput
          attributeName="text_field"
          attributeValue={value}
          description=""
          isOptional
          type={TextInputTypes.text}
          handleInputChange={(submitted) => setValue(submitted ?? "")}
          suggestions={suggestions}
        />
      );
    };

    render(<Controlled />);

    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "10000" } });
    });

    // While editing, the raw value stays visible — it must not flip mid-typing.
    expect(input).toHaveValue("10000");

    // Leaving the field is the commit point: the value resolves to its label.
    await act(async () => {
      fireEvent.blur(input);
    });
    expect(input).toHaveValue("10 Gbps");
  });

  it("maps a stored value back to its label on load (edit round-trip)", () => {
    const suggestions: SuggestionValue[] = [{ label: "10 Gbps", value: "10000" }];

    setup(suggestions, { attributeValue: "10000" });

    // The field shows the label for the previously-saved value.
    expect(screen.getByRole("textbox")).toHaveValue("10 Gbps");
  });

  it("resolves a loaded value to its label once async suggestions arrive (parameters round-trip)", () => {
    const suggestions: SuggestionValue[] = [{ label: "10 Gbps", value: "10000" }];
    const props = {
      attributeName: "text_field",
      attributeValue: "10000",
      description: "",
      isOptional: true,
      type: TextInputTypes.text,
      handleInputChange: vi.fn(),
    };

    // The parameters flavor loads suggestions asynchronously: at first there are none.
    const { rerender } = render(<TextFormInput {...props} suggestions={[]} />);

    expect(screen.getByRole("textbox")).toHaveValue("10000");

    // Once they arrive, the effect re-derives the label for the loaded value.
    rerender(<TextFormInput {...props} suggestions={suggestions} />);

    expect(screen.getByRole("textbox")).toHaveValue("10 Gbps");
  });

  it("renders a numeric field with suggestions as text so a non-numeric label can show", async () => {
    const suggestions: SuggestionValue[] = [{ label: "10 Gbps", value: "10000" }];
    const { handleInputChange } = setup(suggestions, { type: TextInputTypes.number });

    // A native number input (role "spinbutton") could not display "10 Gbps", so
    // suggestion fields render as text (role "textbox").
    const input = screen.getByRole("textbox");

    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.focus(input);
    });

    await act(async () => {
      fireEvent.click(screen.getByText(suggestions[0].label));
    });

    // The label is shown while the (string) value is submitted; the numeric type
    // is enforced later by sanitizeAttributes at submit time.
    expect(input).toHaveValue(suggestions[0].label);
    expect(handleInputChange).toHaveBeenCalledWith(suggestions[0].value, null);
  });
});
