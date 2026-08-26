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
  it("adds the option's value when pressing Enter on an exact match", () => {
    const onAdd = vi.fn();

    renderInput({ onAdd });

    const input = getInput();

    fireEvent.change(input, { target: { value: "One" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onAdd).toHaveBeenCalledWith("one");
    expect(input.value).toBe("");
  });

  it("keeps add disabled for text that is not an option", () => {
    const onAdd = vi.fn();

    renderInput({ onAdd });

    const input = getInput();

    fireEvent.change(input, { target: { value: "hello" } });

    expect(screen.getByTestId("add-button")).toBeDisabled();

    fireEvent.click(screen.getByTestId("add-button"));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("shows the option label but adds its value when they differ", () => {
    const onAdd = vi.fn();

    renderInput({ onAdd, options: [{ value: "id-1", label: "Name One" }] });

    const input = getInput();

    fireEvent.focus(input);
    fireEvent.click(screen.getByText("Name One"));

    // The input shows the human-readable label, not the underlying value.
    expect(input.value).toBe("Name One");

    fireEvent.click(screen.getByTestId("add-button"));

    expect(onAdd).toHaveBeenCalledWith("id-1");
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

  it("calls onToggleInputMode when the toggle link is clicked", () => {
    const onToggleInputMode = vi.fn();

    renderInput({ onToggleInputMode });

    fireEvent.click(screen.getByRole("button", { name: "Use text input" }));

    expect(onToggleInputMode).toHaveBeenCalledTimes(1);
  });

  it("omits the toggle link when no toggle handler is provided", () => {
    renderInput({ onToggleInputMode: undefined, toggleLabel: undefined });

    expect(screen.queryByRole("button", { name: "Use text input" })).not.toBeInTheDocument();
  });
});
