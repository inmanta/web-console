import React, { RefObject } from "react";
import { Button } from "@patternfly/react-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { SuggestionsPopover } from "./SuggestionsPopover";

describe("SuggestionsPopover", () => {
  const suggestions = ["apple", "banana", "cherry"];
  const handleSuggestionClick = jest.fn();
  const filter = "a";
  const setIsOpen = jest.fn();
  const isOpen = true;
  const ref: RefObject<HTMLInputElement> = React.createRef();

  it("renders the popover component", () => {
    render(
      <SuggestionsPopover
        suggestions={suggestions}
        handleSuggestionClick={handleSuggestionClick}
        filter={filter}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
        ref={ref}
      />,
    );

    // Assert that the popover component is rendered
    expect(screen.getByText("apple")).toBeInTheDocument();
    expect(screen.getByText("banana")).toBeInTheDocument();
    // the filter contains 'a' so 'cherry' should not be rendered
    expect(screen.queryByText("cherry")).not.toBeInTheDocument();
  });

  it("calls handleSuggestionClick when a suggestion is clicked", () => {
    render(
      <>
        <input ref={ref} />
        <SuggestionsPopover
          suggestions={suggestions}
          handleSuggestionClick={handleSuggestionClick}
          filter={filter}
          setIsOpen={setIsOpen}
          isOpen={isOpen}
          ref={ref}
        />
      </>,
    );

    // Simulate a click on the 'apple' suggestion
    fireEvent.click(screen.getByLabelText("apple"));

    // Assert that handleSuggestionClick is called with the correct suggestion
    expect(handleSuggestionClick).toHaveBeenCalledWith("apple");
  });

  it("calls setIsOpen when the popover is closed", () => {
    render(
      <>
        <SuggestionsPopover
          suggestions={suggestions}
          handleSuggestionClick={handleSuggestionClick}
          filter={filter}
          setIsOpen={setIsOpen}
          isOpen={isOpen}
          ref={ref}
        />
        <input ref={ref} />
        <Button id="button">Some button</Button>
      </>,
    );

    // Simulate a click outside the popover
    fireEvent.click(screen.getByText("Some button"));

    // Assert that setIsOpen is called with false
    expect(setIsOpen).toHaveBeenCalledWith(false);
  });

  it("handles menu key events", () => {
    render(
      <>
        <input ref={ref} />
        <SuggestionsPopover
          suggestions={suggestions}
          handleSuggestionClick={handleSuggestionClick}
          filter={filter}
          setIsOpen={setIsOpen}
          isOpen={isOpen}
          ref={ref}
        />
      </>,
    );

    const input = screen.getByRole("textbox");

    // Simulate pressing the down arrow key
    fireEvent.keyDown(input, { key: "ArrowDown" });

    // Assert that the first suggestion is focused
    expect(screen.getByRole("menuitem", { name: "apple" })).toHaveFocus();

    // simulate pressing the escape key
    fireEvent.keyDown(input, { key: "Escape" });

    // Assert that setIsOpen is called with false
    expect(setIsOpen).toHaveBeenCalledWith(false);

    // simulate clicking on the input after the popover is closed
    fireEvent.click(input);

    // Assert that the popover is opened
    expect(screen.getByText("apple")).toBeInTheDocument();

    // simulate pressing the up tab key
    fireEvent.keyDown(input, { key: "Tab" });

    // Assert that the popover is closed
    expect(setIsOpen).toHaveBeenCalledWith(false);

    // simulate clicking on the input after the popover is closed
    fireEvent.click(input);

    // simulate pressing the arrow down key
    fireEvent.keyDown(input, { key: "ArrowDown" });

    // simulate pressing the enter key on the focused suggestion
    const firstOption = screen.getByText("apple");
    fireEvent.keyDown(firstOption, { key: "Enter" });

    // Assert that handleSuggestionClick is called with the correct suggestion
    expect(handleSuggestionClick).toHaveBeenCalledWith("apple");
  });
});
