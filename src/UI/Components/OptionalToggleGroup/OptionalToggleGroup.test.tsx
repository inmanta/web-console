import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { OptionalToggleGroup } from "./OptionalToggleGroup";

const options = [
  { label: "Orphaned", value: "orphaned", buttonId: "orphaned-include" },
  { label: "Not Orphaned", value: "!orphaned", buttonId: "orphaned-exclude" },
];

const iconOptions = [
  {
    value: "orphaned",
    buttonId: "orphaned-include",
    icon: { active: <span>active</span>, inactive: <span>inactive</span> },
    ariaLabel: "Include Orphaned",
  },
  {
    value: "!orphaned",
    buttonId: "orphaned-exclude",
    icon: { active: <span>active</span>, inactive: <span>inactive</span> },
    ariaLabel: "Exclude Orphaned",
  },
];

const booleanOptions = [
  { label: "True", value: true, buttonId: "field-true" },
  { label: "False", value: false, buttonId: "field-false" },
];

describe("OptionalToggleGroup", () => {
  it("GIVEN one option active WHEN the other option is clicked THEN it replaces the active one", async () => {
    const onChange = vi.fn();

    render(<OptionalToggleGroup options={options} selected={["orphaned"]} onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Not Orphaned" }));

    expect(onChange).toHaveBeenCalledWith(["!orphaned"]);
  });

  it("GIVEN one option active WHEN that same option is clicked THEN it is deselected", async () => {
    const onChange = vi.fn();

    render(<OptionalToggleGroup options={options} selected={["!orphaned"]} onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Not Orphaned" }));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("GIVEN icon options without a label WHEN one is clicked THEN it is reachable by its ariaLabel and toggles", async () => {
    const onChange = vi.fn();

    render(<OptionalToggleGroup options={iconOptions} selected={[]} onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Exclude Orphaned" }));

    expect(onChange).toHaveBeenCalledWith(["!orphaned"]);
  });

  it("GIVEN isDisabled WHEN an option is clicked THEN every option is disabled and onChange is not called", async () => {
    const onChange = vi.fn();

    render(
      <OptionalToggleGroup
        options={options}
        selected={["orphaned"]}
        onChange={onChange}
        isDisabled
      />
    );

    const optionButtons = options.map((option) =>
      screen.getByRole("button", { name: option.label })
    );

    optionButtons.forEach((button) => expect(button).toBeDisabled());

    await userEvent.click(optionButtons[1]);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("GIVEN an active option WHEN it is clicked to deselect THEN the button loses focus so it no longer appears active", async () => {
    const onChange = vi.fn();

    render(<OptionalToggleGroup options={options} selected={["orphaned"]} onChange={onChange} />);

    const button = screen.getByRole("button", { name: "Orphaned" });

    await userEvent.click(button);

    expect(onChange).toHaveBeenCalledWith([]);
    expect(button).not.toHaveFocus();
  });

  it("GIVEN no active option WHEN one is activated THEN the button keeps focus", async () => {
    const onChange = vi.fn();

    render(<OptionalToggleGroup options={options} selected={[]} onChange={onChange} />);

    const button = screen.getByRole("button", { name: "Orphaned" });

    await userEvent.click(button);

    expect(onChange).toHaveBeenCalledWith(["orphaned"]);
    expect(button).toHaveFocus();
  });

  describe("with boolean values", () => {
    it("GIVEN nothing selected WHEN the false option is clicked THEN onChange is called with [false]", async () => {
      const onChange = vi.fn();

      render(
        <OptionalToggleGroup<boolean> options={booleanOptions} selected={[]} onChange={onChange} />
      );

      await userEvent.click(screen.getByRole("button", { name: "False" }));

      // false is falsy, so this guards that selecting it is not dropped.
      expect(onChange).toHaveBeenCalledWith([false]);
    });

    it("GIVEN false selected WHEN the true option is clicked THEN it replaces false with [true]", async () => {
      const onChange = vi.fn();

      render(
        <OptionalToggleGroup<boolean>
          options={booleanOptions}
          selected={[false]}
          onChange={onChange}
        />
      );

      await userEvent.click(screen.getByRole("button", { name: "True" }));

      expect(onChange).toHaveBeenCalledWith([true]);
    });

    it("GIVEN false selected WHEN that same false option is clicked THEN it is deselected to []", async () => {
      const onChange = vi.fn();

      render(
        <OptionalToggleGroup<boolean>
          options={booleanOptions}
          selected={[false]}
          onChange={onChange}
        />
      );

      await userEvent.click(screen.getByRole("button", { name: "False" }));

      // Deselecting must recognise the falsy false value as currently selected.
      expect(onChange).toHaveBeenCalledWith([]);
    });
  });
});
