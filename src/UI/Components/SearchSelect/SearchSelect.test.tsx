import React, { useState } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { SearchSelect, TEST_IDS } from "./SearchSelect";

const OPTIONS = ["Apple", "Banana", "Blueberry", "Cherry", "Grape"];

/**
 * Simple setup helper:
 * - renders component
 * - provides spies
 * - exposes query helpers
 */
function setup(overrides: Partial<React.ComponentProps<typeof SearchSelect>> = {}) {
  const onChange = vi.fn();
  const onClear = vi.fn();

  render(<SearchSelect value="" options={OPTIONS} onChange={onChange} {...overrides} />);

  return {
    onChange,
    onClear,
    input: () => screen.getByTestId(TEST_IDS.input),
    menu: () => screen.queryByTestId(TEST_IDS.menu),
    menuItem: (option: string) => screen.getByRole("option", { name: TEST_IDS.menuItem(option) }),
    menuItems: () => screen.queryAllByRole("option"),
    clearButton: () => screen.getByRole("button", { name: "Reset" }),
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

    it("does not render menu items when no matches", () => {
      const { input, menu, menuItems } = setup({ value: "zzz" });

      fireEvent.focus(input());

      expect(menu()).toBeInTheDocument();
      expect(menuItems()).toHaveLength(0);
    });
  });

  describe("filtering", () => {
    it("filters by startsWith (default)", () => {
      const { input, menuItems, menuItem } = setup({ value: "b" });

      fireEvent.focus(input());

      expect(menuItems()).toHaveLength(2);
      expect(menuItem("Banana")).toBeInTheDocument();
      expect(menuItem("Blueberry")).toBeInTheDocument();
    });

    it("filters by includes", () => {
      const { input, menuItems, menuItem } = setup({
        value: "AN",
        filterStrategy: "includes",
      });

      fireEvent.focus(input());

      expect(menuItems()).toHaveLength(1);
      expect(menuItem("Banana")).toBeInTheDocument();
    });

    it("shows all options with filterStrategy='all'", () => {
      const { input, menuItems } = setup({
        value: "zzz",
        filterStrategy: "all",
      });

      fireEvent.focus(input());

      expect(menuItems()).toHaveLength(OPTIONS.length);
    });

    it("supports custom filter function", () => {
      const { input, menuItems, menuItem } = setup({
        value: "x",
        filterStrategy: (_: string, __: string) => _ === "Grape",
      });

      fireEvent.focus(input());

      expect(menuItems()).toHaveLength(1);
      expect(menuItem("Grape")).toBeInTheDocument();
    });

    it("respects maxItems", () => {
      const { input, menuItems, menuItem } = setup({ maxItems: 2 });

      fireEvent.focus(input());

      expect(menuItems()).toHaveLength(2);
      expect(menuItem("Apple")).toBeInTheDocument();
      expect(menuItem("Banana")).toBeInTheDocument();
    });
  });

  describe("interaction", () => {
    it("calls onChange when typing", async () => {
      const { onChange, input } = setup();
      await userEvent.type(input(), "a");
      expect(onChange).toHaveBeenCalledWith("a");
    });

    it("calls onChange when selecting an option", async () => {
      const { onChange, input, menuItem } = setup();

      await userEvent.click(input());
      await userEvent.click(menuItem("Cherry"));

      expect(onChange).toHaveBeenCalledWith("Cherry");
    });

    it("closes menu after selecting option", async () => {
      const { input, menu, menuItem } = setup();

      await userEvent.click(input());
      await userEvent.click(menuItem("Cherry"));

      await waitFor(() => {
        expect(menu()).not.toBeInTheDocument();
      });
    });

    it("calls onChange when cleared", () => {
      const { onChange, clearButton } = setup({ value: "Apple" });

      fireEvent.click(clearButton());

      expect(onChange).toHaveBeenCalledWith("");
    });

    it("reopens with all options after clearing", async () => {
      function Wrapper() {
        const [value, setValue] = useState("Apple");

        return <SearchSelect value={value} options={OPTIONS} onChange={(v) => setValue(v)} />;
      }

      render(<Wrapper />);

      await userEvent.click(screen.getByRole("button", { name: "Reset" }));

      expect(screen.getAllByRole("option").length).toBe(OPTIONS.length);
    });
  });
});
