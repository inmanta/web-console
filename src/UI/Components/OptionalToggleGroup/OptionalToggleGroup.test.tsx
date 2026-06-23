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
});
