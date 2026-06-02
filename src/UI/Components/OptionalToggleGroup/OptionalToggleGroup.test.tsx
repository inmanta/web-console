import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { OptionalToggleGroup } from "./OptionalToggleGroup";

const options = [
  { label: "Orphaned", value: "orphaned", buttonId: "orphaned-include" },
  { label: "Not Orphaned", value: "!orphaned", buttonId: "orphaned-exclude" },
];

describe("OptionalToggleGroup", () => {
  it("GIVEN one option active WHEN the other option is clicked THEN it replaces the active one", async () => {
    const onChange = vi.fn();

    render(
      <OptionalToggleGroup options={options} selected={["orphaned"]} onChange={onChange} />
    );

    await userEvent.click(screen.getByRole("button", { name: "Not Orphaned" }));

    expect(onChange).toHaveBeenCalledWith(["!orphaned"]);
  });

  it("GIVEN one option active WHEN that same option is clicked THEN it is deselected", async () => {
    const onChange = vi.fn();

    render(
      <OptionalToggleGroup options={options} selected={["!orphaned"]} onChange={onChange} />
    );

    await userEvent.click(screen.getByRole("button", { name: "Not Orphaned" }));

    expect(onChange).toHaveBeenCalledWith([]);
  });
});
