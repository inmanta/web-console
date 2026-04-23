import { render, screen, fireEvent } from "@testing-library/react";
import { AddableSelectInput } from "./AddableSelectInput";

const options = [
  { value: "one", label: "One" },
  { value: "two", label: "Two" },
];

const getInput = () =>
  screen.getByTestId("search-input").querySelector("input") as HTMLInputElement;

describe("AddableSelectInput", () => {
  it("adds typed value when add button is clicked", () => {
    const onAdd = vi.fn();
    const onFilter = vi.fn();
    const onReachEnd = vi.fn();
    const onToggleInputMode = vi.fn();

    render(
      <AddableSelectInput
        label="Test"
        options={options}
        onAdd={onAdd}
        onFilter={onFilter}
        isLoading={false}
        onReachEnd={onReachEnd}
        onToggleInputMode={onToggleInputMode}
      />
    );

    const input = getInput();
    const button = screen.getByTestId("add-button");

    fireEvent.change(input, { target: { value: "hello" } });
    fireEvent.click(button);

    expect(onAdd).toHaveBeenCalledWith("hello");
    expect(input.value).toBe("");
  });

  it("calls onFilter when typing", () => {
    const onAdd = vi.fn();
    const onFilter = vi.fn();
    const onReachEnd = vi.fn();
    const onToggleInputMode = vi.fn();

    render(
      <AddableSelectInput
        label="Test"
        options={options}
        onAdd={onAdd}
        onFilter={onFilter}
        isLoading={false}
        onReachEnd={onReachEnd}
        onToggleInputMode={onToggleInputMode}
      />
    );

    const input = getInput();

    fireEvent.change(input, { target: { value: "abc" } });

    expect(onFilter).toHaveBeenCalledWith("abc");
  });

  it("clears input when clear button is used", () => {
    const onAdd = vi.fn();
    const onFilter = vi.fn();
    const onReachEnd = vi.fn();
    const onToggleInputMode = vi.fn();

    render(
      <AddableSelectInput
        label="Test"
        options={options}
        onAdd={onAdd}
        onFilter={onFilter}
        isLoading={false}
        onReachEnd={onReachEnd}
        onToggleInputMode={onToggleInputMode}
      />
    );

    const input = getInput();

    fireEvent.change(input, { target: { value: "something" } });
    fireEvent.click(screen.getByLabelText("clear-button"));

    expect(input.value).toBe("");
    expect(onFilter).toHaveBeenCalledWith("");
  });

  it("adds value when pressing Enter", () => {
    const onAdd = vi.fn();
    const onFilter = vi.fn();
    const onReachEnd = vi.fn();
    const onToggleInputMode = vi.fn();

    render(
      <AddableSelectInput
        label="Test"
        options={options}
        onAdd={onAdd}
        onFilter={onFilter}
        isLoading={false}
        onReachEnd={onReachEnd}
        onToggleInputMode={onToggleInputMode}
      />
    );

    const input = getInput();

    fireEvent.change(input, { target: { value: "enter-value" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onAdd).toHaveBeenCalledWith("enter-value");
    expect(input.value).toBe("");
  });
});
