import { render, screen, fireEvent } from "@testing-library/react";
import { AddableSelectInput } from "./AddableSelectInput";

const options = [
  { value: "one", label: "One" },
  { value: "two", label: "Two" },
];

const getInput = () =>
  screen.getByTestId("search-input").querySelector("input") as HTMLInputElement;

const renderInput = (overrides = {}) =>
  render(
    <AddableSelectInput
      label="Test"
      options={options}
      onAdd={vi.fn()}
      onFilter={vi.fn()}
      isLoading={false}
      onReachEnd={vi.fn()}
      onToggleInputMode={vi.fn()}
      toggleLabel="Use text input"
      {...overrides}
    />
  );

describe("AddableSelectInput", () => {
  it("adds typed value when add button is clicked", () => {
    const onAdd = vi.fn();

    renderInput({ onAdd });

    const input = getInput();
    const button = screen.getByTestId("add-button");

    fireEvent.change(input, { target: { value: "hello" } });
    fireEvent.click(button);

    expect(onAdd).toHaveBeenCalledWith("hello");
    expect(input.value).toBe("");
  });

  it("calls onFilter when typing", () => {
    const onFilter = vi.fn();

    renderInput({ onFilter });

    const input = getInput();

    fireEvent.change(input, { target: { value: "abc" } });

    expect(onFilter).toHaveBeenCalledWith("abc");
  });

  it("clears input when clear button is used", () => {
    const onFilter = vi.fn();

    renderInput({ onFilter });

    const input = getInput();

    fireEvent.change(input, { target: { value: "something" } });
    fireEvent.click(screen.getByLabelText("clear-button"));

    expect(input.value).toBe("");
    expect(onFilter).toHaveBeenCalledWith("");
  });

  it("adds value when pressing Enter", () => {
    const onAdd = vi.fn();

    renderInput({ onAdd });

    const input = getInput();

    fireEvent.change(input, { target: { value: "enter-value" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onAdd).toHaveBeenCalledWith("enter-value");
    expect(input.value).toBe("");
  });

  it("calls onToggleInputMode when the toggle link is clicked", () => {
    const onToggleInputMode = vi.fn();

    renderInput({ onToggleInputMode });

    fireEvent.click(screen.getByRole("button", { name: "Use text input" }));

    expect(onToggleInputMode).toHaveBeenCalledTimes(1);
  });
});
