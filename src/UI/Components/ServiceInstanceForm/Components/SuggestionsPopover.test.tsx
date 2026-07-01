import React, { RefObject } from "react";
import { Button } from "@patternfly/react-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { SuggestionValue } from "@/Core";
import { SuggestionsPopover } from "./SuggestionsPopover";

describe("SuggestionsPopover", () => {
  const suggestions: SuggestionValue[] = [
    { label: "apple", value: "apple" },
    { label: "banana", value: "banana" },
    { label: "cherry", value: "cherry" },
  ];
  const handleSuggestionClick = vi.fn();
  const filter = "a";
  const close = vi.fn();
  const isOpen = true;
  const ref: RefObject<HTMLInputElement | null> = React.createRef();

  it("shows the label, filters on the label, and submits the value when label differs from value", () => {
    const labeled: SuggestionValue[] = [
      { label: "Production network", value: "9f3c1b2a-prod" },
      { label: "Staging network", value: "00000000-stag" },
    ];

    render(
      <>
        <input ref={ref} />
        <SuggestionsPopover
          suggestions={labeled}
          handleSuggestionClick={handleSuggestionClick}
          filter="production"
          close={close}
          isOpen={isOpen}
          ref={ref}
        />
      </>
    );

    // The human-friendly label is shown, the raw value is not.
    expect(screen.getByText(labeled[0].label)).toBeInTheDocument();
    expect(screen.queryByText(labeled[0].value)).not.toBeInTheDocument();
    // Filtering matches the label, so the non-matching suggestion is hidden.
    expect(screen.queryByText(labeled[1].label)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText(labeled[0].label));

    // Clicking submits the value, not the displayed label.
    expect(handleSuggestionClick).toHaveBeenCalledWith(labeled[0].value);
  });

  it("calls close when the popover is closed", () => {
    render(
      <>
        <SuggestionsPopover
          suggestions={suggestions}
          handleSuggestionClick={handleSuggestionClick}
          filter={filter}
          close={close}
          isOpen={isOpen}
          ref={ref}
        />
        <input ref={ref} />
        <Button id="button">Some button</Button>
      </>
    );

    // Simulate a click outside the popover
    fireEvent.click(screen.getByText("Some button"));

    // Assert that the popover closes
    expect(close).toHaveBeenCalled();
  });

  it("handles menu key events", () => {
    render(
      <>
        <input ref={ref} />
        <SuggestionsPopover
          suggestions={suggestions}
          handleSuggestionClick={handleSuggestionClick}
          filter={filter}
          close={close}
          isOpen={isOpen}
          ref={ref}
        />
      </>
    );

    const input = screen.getByRole("textbox");

    // Simulate pressing the down arrow key
    fireEvent.keyDown(input, { key: "ArrowDown" });

    // Assert that the first suggestion is focused
    expect(screen.getByRole("menuitem", { name: suggestions[0].label })).toHaveFocus();

    // simulate pressing the escape key
    fireEvent.keyDown(input, { key: "Escape" });

    // Assert that the popover closes
    expect(close).toHaveBeenCalled();

    // simulate clicking on the input after the popover is closed
    fireEvent.click(input);

    // Assert that the popover is opened
    expect(screen.getByText(suggestions[0].label)).toBeInTheDocument();

    // simulate pressing the up tab key
    fireEvent.keyDown(input, { key: "Tab" });

    // Assert that the popover is closed
    expect(close).toHaveBeenCalled();

    // simulate clicking on the input after the popover is closed
    fireEvent.click(input);

    // simulate pressing the arrow down key
    fireEvent.keyDown(input, { key: "ArrowDown" });

    // simulate pressing the enter key on the focused suggestion
    const firstOption = screen.getByText(suggestions[0].label);

    fireEvent.keyDown(firstOption, { key: "Enter" });

    // Assert that handleSuggestionClick is called with the correct suggestion value
    expect(handleSuggestionClick).toHaveBeenCalledWith(suggestions[0].value);
  });
});
