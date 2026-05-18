import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { words } from "@/UI";
import { invertFilter } from "../utils";
import { IncludeExcludeSelect } from "./IncludeExcludeSelect";

const options = ["blocked", "not_blocked", "temporarily_blocked"];
const label = words("resources.filters.status.blocked.label");
const placeholder = words("resources.filters.status.blocked.placeholder");

const defaultProps = {
  label,
  placeholder,
  selected: [],
  options,
  onOptionClick: vi.fn(),
};

describe("IncludeExcludeSelect", () => {
  describe("toggle", () => {
    it("renders the placeholder text in the toggle button", () => {
      render(<IncludeExcludeSelect {...defaultProps} />);

      expect(screen.getByText(placeholder)).toBeVisible();
    });

    it("does not render options when closed", () => {
      render(<IncludeExcludeSelect {...defaultProps} />);

      expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    });

    it("opens the dropdown and renders all options when the toggle is clicked", async () => {
      render(<IncludeExcludeSelect {...defaultProps} />);

      const toggle = screen.getByRole("button", { name: `${label}-toggle` });
      await userEvent.click(toggle);

      expect(screen.getByRole("grid")).toBeVisible();
      expect(screen.getByText("blocked")).toBeVisible();
      expect(screen.getByText("not_blocked")).toBeVisible();
      expect(screen.getByText("temporarily_blocked")).toBeVisible();
    });

    it("closes the dropdown when the toggle is clicked again", async () => {
      render(<IncludeExcludeSelect {...defaultProps} />);

      const toggle = screen.getByRole("button", { name: `${label}-toggle` });
      await userEvent.click(toggle);
      await userEvent.click(toggle);

      expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    });
  });

  describe("include interaction", () => {
    it("calls onOptionClick with the option value when include is triggered", async () => {
      const onOptionClick = vi.fn();
      render(<IncludeExcludeSelect {...defaultProps} onOptionClick={onOptionClick} />);

      const toggle = screen.getByRole("button", { name: `${label}-toggle` });
      await userEvent.click(toggle);
      const menuToggle = screen.getByRole("button", { name: "blocked-include-toggle" });
      await userEvent.click(menuToggle);

      expect(onOptionClick).toHaveBeenCalledWith("blocked");
      expect(onOptionClick).toHaveBeenCalledTimes(1);
    });

    it("reflects active include state for selected options", async () => {
      render(<IncludeExcludeSelect {...defaultProps} selected={["blocked"]} />);

      const toggle = screen.getByRole("button", { name: `${label}-toggle` });
      await userEvent.click(toggle);

      expect(screen.getByLabelText("blocked-include-active")).toBeInTheDocument();
      expect(screen.getByLabelText("not_blocked-include-inactive")).toBeInTheDocument();
    });
  });

  describe("exclude interaction", () => {
    it("calls onOptionClick with the inverted value when exclude is triggered", async () => {
      const onOptionClick = vi.fn();
      render(<IncludeExcludeSelect {...defaultProps} onOptionClick={onOptionClick} />);

      const toggle = screen.getByRole("button", { name: `${label}-toggle` });
      await userEvent.click(toggle);
      await userEvent.click(screen.getByRole("button", { name: "blocked-exclude-toggle" }));

      expect(onOptionClick).toHaveBeenCalledWith(invertFilter("blocked"));
      expect(onOptionClick).toHaveBeenCalledTimes(1);
    });

    it("reflects active exclude state when inverted value is selected", async () => {
      render(<IncludeExcludeSelect {...defaultProps} selected={[invertFilter("blocked")]} />);

      const toggle = screen.getByRole("button", { name: `${label}-toggle` });
      await userEvent.click(toggle);

      expect(screen.getByLabelText("blocked-exclude-active")).toBeInTheDocument();
      expect(screen.getByLabelText("blocked-include-inactive")).toBeInTheDocument();
    });
  });

  describe("multiple selections", () => {
    it("correctly reflects include and exclude active states across multiple selected options", async () => {
      render(
        <IncludeExcludeSelect
          {...defaultProps}
          selected={["blocked", invertFilter("not_blocked")]}
        />
      );

      const toggle = screen.getByRole("button", { name: `${label}-toggle` });
      await userEvent.click(toggle);

      expect(screen.getByLabelText("blocked-include-active")).toBeInTheDocument();
      expect(screen.getByLabelText("not_blocked-exclude-active")).toBeInTheDocument();
      expect(screen.getByLabelText("temporarily_blocked-include-inactive")).toBeInTheDocument();
      expect(screen.getByLabelText("temporarily_blocked-exclude-inactive")).toBeInTheDocument();
    });
  });
});
