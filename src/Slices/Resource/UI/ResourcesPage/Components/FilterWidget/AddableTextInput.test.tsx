import { fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { words } from "@/UI";
import { AddableTextInput } from "./AddableTextInput";

describe("AddableTextInput", () => {
  it("adds a trimmed value when the add button is clicked", async () => {
    const handleAdd = vi.fn();

    render(
      <AddableTextInput
        label="Type"
        placeholder={words("resources.filters.resource.type.placeholder")}
        onAdd={handleAdd}
      />
    );

    const input = screen.getByPlaceholderText(words("resources.filters.resource.type.placeholder"));

    await userEvent.type(input, "  example  ");

    const addButton = screen.getByTestId("add-button");
    await userEvent.click(addButton);

    expect(handleAdd).toHaveBeenCalledTimes(1);
    expect(handleAdd).toHaveBeenCalledWith("example");
    expect(input).toHaveValue("");
  });

  it("does not call onAdd for empty or whitespace-only values", async () => {
    const handleAdd = vi.fn();

    render(
      <AddableTextInput
        label="Agent"
        placeholder={words("resources.filters.resource.agent.placeholder")}
        onAdd={handleAdd}
      />
    );

    const input = screen.getByPlaceholderText(
      words("resources.filters.resource.agent.placeholder")
    );

    await userEvent.type(input, "   ");
    const addButton = screen.getByTestId("add-button");
    await userEvent.click(addButton);

    expect(handleAdd).not.toHaveBeenCalled();
    expect(input).toHaveValue("   ");
  });

  it("adds the current value when the enter key is pressed", async () => {
    const handleAdd = vi.fn();

    render(
      <AddableTextInput
        label="Value"
        placeholder={words("resources.filters.resource.value.placeholder")}
        onAdd={handleAdd}
      />
    );

    const input = screen.getByPlaceholderText(
      words("resources.filters.resource.value.placeholder")
    );

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
});
