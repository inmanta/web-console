import { fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { AddableTextInput } from "./AddableTextInput";

describe("AddableTextInput", () => {
  it("adds a trimmed value when the add button is clicked", async () => {
    const handleAdd = vi.fn();

    render(<AddableTextInput label="Type" placeholder="Type..." onAdd={handleAdd} />);

    const input = screen.getByPlaceholderText("Type...");

    await userEvent.type(input, "  example  ");

    const addButton = screen.getByTestId("add-button");
    await userEvent.click(addButton);

    expect(handleAdd).toHaveBeenCalledTimes(1);
    expect(handleAdd).toHaveBeenCalledWith("example");
    expect(input).toHaveValue("");
  });

  it("disables the add button and does not call onAdd for empty or whitespace-only values", async () => {
    const handleAdd = vi.fn();

    render(<AddableTextInput label="Agent" placeholder="Agent..." onAdd={handleAdd} />);

    const input = screen.getByPlaceholderText("Agent...");

    expect(screen.getByTestId("add-button")).toBeDisabled();

    await userEvent.type(input, "   ");

    expect(screen.getByTestId("add-button")).toBeDisabled();

    fireEvent.keyPress(input, { key: "Enter", code: "Enter", charCode: 13 });

    expect(handleAdd).not.toHaveBeenCalled();
    expect(input).toHaveValue("   ");
  });

  it("adds the current value when the enter key is pressed", async () => {
    const handleAdd = vi.fn();

    render(<AddableTextInput label="Value" placeholder="Value..." onAdd={handleAdd} />);

    const input = screen.getByPlaceholderText("Value...");

    await userEvent.type(input, "to-add");

    fireEvent.keyPress(input, {
      key: "Enter",
      code: "Enter",
      charCode: 13,
    });

    expect(handleAdd).toHaveBeenCalledWith("to-add");
    expect(input).toHaveValue("");
  });

  it("shows the hint in a popover when hovering the help icon", async () => {
    const user = userEvent.setup();

    render(
      <AddableTextInput
        label="Type"
        placeholder="Type..."
        onAdd={vi.fn()}
        hint="This is a helpful hint"
      />
    );
    const helpIcon = screen.getByLabelText("help");
    await user.hover(helpIcon);
    const hint = await screen.findByText("This is a helpful hint");
    expect(hint).toBeInTheDocument();
  });

  it("renders the toggle link and calls onToggleInputMode when clicked", async () => {
    const handleToggle = vi.fn();

    render(
      <AddableTextInput
        label="Agent"
        placeholder="Agent..."
        onAdd={vi.fn()}
        toggleLabel="Use select input"
        onToggleInputMode={handleToggle}
      />
    );

    const toggle = screen.getByRole("button", { name: "Use select input" });
    await userEvent.click(toggle);

    expect(handleToggle).toHaveBeenCalledTimes(1);
  });
});
