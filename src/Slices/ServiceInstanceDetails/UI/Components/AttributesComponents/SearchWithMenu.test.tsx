import React, { useState } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { SearchWithMenu, TEST_IDS } from "./SearchWithMenu";

const OPTIONS = ["Apple", "Banana", "Blueberry", "Cherry", "Grape"];

/**
 * Simple setup helper:
 * - renders component
 * - provides spies
 * - exposes query helpers
 */
function setup(overrides: Partial<React.ComponentProps<typeof SearchWithMenu>> = {}) {
  const onChange = vi.fn();
  const onClear = vi.fn();

  render(
    <SearchWithMenu
      value=""
      options={OPTIONS}
      onChange={onChange}
      onClear={onClear}
      {...overrides}
    />
  );

  return {
    onChange,
    onClear,
    input: () => screen.getByTestId(TEST_IDS.input),
    menu: () => screen.queryByTestId(TEST_IDS.menu),
    menuItems: () => screen.queryAllByRole("menuitem"),
    clearButton: () => screen.queryByRole("button", { name: "Reset" }),
    getMenuItemButton: (name: string) =>
      screen.getByTestId(TEST_IDS.menuItem(name)).querySelector("button")!,
  };
}

describe("SearchWithMenu", () => {
  describe("rendering", () => {
    it("renders the search input", () => {
      const { input } = setup();
      expect(input()).toBeInTheDocument();
    });

    it("shows placeholder text", () => {
      setup({ placeholder: "Pick a fruit" });
      expect(screen.getByPlaceholderText("Pick a fruit")).toBeInTheDocument();
    });
  });

  describe("menu visibility", () => {
    it("opens the menu on focus", () => {
      const { input, menu } = setup();

      fireEvent.focus(input());

      expect(menu()).toBeInTheDocument();
    });

    it("closes the menu when clicking outside", async () => {
      const { input, menu } = setup();

      fireEvent.focus(input());
      expect(menu()).toBeInTheDocument();

      fireEvent.mouseDown(document.body);
      fireEvent.click(document.body);

      await waitFor(() => {
        expect(menu()).not.toBeInTheDocument();
      });
    });

    it("does not render menu when no matches", () => {
      const { input, menu } = setup({ value: "zzz" });

      fireEvent.focus(input());

      expect(menu()).not.toBeInTheDocument();
    });
  });

  describe("filtering", () => {
    it("filters by startsWith (default)", () => {
      const { input, menuItems } = setup({ value: "b" });

      fireEvent.focus(input());

      expect(menuItems().map((i) => i.textContent)).toEqual(["Banana", "Blueberry"]);
    });

    it("filters by includes", () => {
      const { input, menuItems } = setup({
        value: "AN",
        filterStrategy: "includes",
      });

      fireEvent.focus(input());

      expect(menuItems().map((i) => i.textContent)).toEqual(["Banana"]);
    });

    it("shows all options with filterStrategy='all'", () => {
      const { input, menuItems } = setup({
        value: "zzz",
        filterStrategy: "all",
      });

      fireEvent.focus(input());

      expect(menuItems().length).toBe(OPTIONS.length);
    });

    it("supports custom filter function", () => {
      const { input, menuItems } = setup({
        value: "x",
        filterStrategy: (_: string, __: string) => _ === "Grape",
      });

      fireEvent.focus(input());

      expect(menuItems().map((i) => i.textContent)).toEqual(["Grape"]);
    });

    it("respects maxItems", () => {
      const { input, menuItems } = setup({ maxItems: 2 });

      fireEvent.focus(input());

      expect(menuItems().length).toBe(2);
    });
  });

  describe("interaction", () => {
    it("calls onChange when typing", async () => {
      const { onChange, input } = setup();
      await userEvent.type(input(), "a");
      expect(onChange).toHaveBeenCalledWith("a");
    });

    it("calls onChange when selecting an option", async () => {
      const { onChange, input, getMenuItemButton } = setup();

      await userEvent.click(input());
      await userEvent.click(getMenuItemButton("Cherry"));

      expect(onChange).toHaveBeenCalledWith("Cherry");
    });

    it("closes menu after selecting option", async () => {
      const { input, menu, getMenuItemButton } = setup();

      await userEvent.click(input());
      await userEvent.click(getMenuItemButton("Cherry"));

      await waitFor(() => {
        expect(menu()).not.toBeInTheDocument();
      });
    });

    it("calls onChange and onClear when cleared", () => {
      const { onChange, onClear, clearButton } = setup({ value: "Apple" });

      fireEvent.click(clearButton()!);

      expect(onChange).toHaveBeenCalledWith("");
      expect(onClear).toHaveBeenCalled();
    });

    it("reopens with all options after clearing", async () => {
      function Wrapper() {
        const [value, setValue] = useState("Apple");

        return <SearchWithMenu value={value} options={OPTIONS} onChange={(v) => setValue(v)} />;
      }

      render(<Wrapper />);

      await userEvent.click(screen.getByRole("button", { name: "Reset" }));

      expect(screen.getAllByRole("menuitem").length).toBe(OPTIONS.length);
    });
  });
});
