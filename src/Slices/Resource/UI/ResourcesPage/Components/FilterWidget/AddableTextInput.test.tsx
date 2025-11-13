import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { AddableTextInput } from "./AddableTextInput";

describe("AddableTextInput", () => {
    it("adds a trimmed value when the add button is clicked", async () => {
        const handleAdd = vi.fn();

        render(
            <AddableTextInput
                label="Type"
                placeholder="Type..."
                onAdd={handleAdd}
            />
        );

        const input = screen.getByPlaceholderText("Type...");

        await userEvent.type(input, "  example  ");

        await userEvent.click(
            screen.getByRole("button", {
                name: "+",
            })
        );

        expect(handleAdd).toHaveBeenCalledTimes(1);
        expect(handleAdd).toHaveBeenCalledWith("example");
        expect(input).toHaveValue("");
    });

    it("does not call onAdd for empty or whitespace-only values", async () => {
        const handleAdd = vi.fn();

        render(
            <AddableTextInput
                label="Agent"
                placeholder="Agent..."
                onAdd={handleAdd}
            />
        );

        const input = screen.getByPlaceholderText("Agent...");

        await userEvent.type(input, "   ");
        await userEvent.click(screen.getByRole("button", { name: "+" }));

        expect(handleAdd).not.toHaveBeenCalled();
        expect(input).toHaveValue("   ");
    });

    it("adds the current value when the enter key is pressed", async () => {
        const handleAdd = vi.fn();

        render(
            <AddableTextInput
                label="Value"
                placeholder="Value..."
                onAdd={handleAdd}
            />
        );

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
});


