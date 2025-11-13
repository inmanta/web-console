import React from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ActiveFilterGroup } from "./ActiveFilterGroup";

describe("ActiveFilterGroup", () => {
  it("returns null when there are no values", () => {
    const { container } = render(<ActiveFilterGroup title="Type" values={[]} onRemove={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders chips for each value", () => {
    render(<ActiveFilterGroup title="Agent" values={["agent-a", "agent-b"]} onRemove={vi.fn()} />);

    expect(screen.getByText("agent-a")).toBeInTheDocument();
    expect(screen.getByText("agent-b")).toBeInTheDocument();
  });

  it("calls onRemove when a chip is dismissed", async () => {
    const handleRemove = vi.fn();

    render(<ActiveFilterGroup title="Value" values={["value-1"]} onRemove={handleRemove} />);

    const closeButton = screen.getByRole("button", {
      name: /close value-1/i,
    });

    await userEvent.click(closeButton);

    expect(handleRemove).toHaveBeenCalledTimes(1);
    expect(handleRemove).toHaveBeenCalledWith("value-1");
  });

  it("calls onRemoveGroup when the group close button is pressed", async () => {
    const handleRemoveGroup = vi.fn();

    render(
      <ActiveFilterGroup
        title="Type"
        values={["test"]}
        onRemove={vi.fn()}
        onRemoveGroup={handleRemoveGroup}
      />
    );

    const groupCloseButton = screen.getByRole("button", {
      name: /Remove Type filters/,
    });

    await userEvent.click(groupCloseButton);

    expect(handleRemoveGroup).toHaveBeenCalledTimes(1);
  });
});
