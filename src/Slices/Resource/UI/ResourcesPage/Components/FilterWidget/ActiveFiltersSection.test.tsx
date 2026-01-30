import React from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ActiveFiltersSection } from "./ActiveFiltersSection";

const createHandlers = () => ({
  onClearAll: vi.fn(),
  removeTypeChip: vi.fn(),
  removeAgentChip: vi.fn(),
  removeValueChip: vi.fn(),
  removeStatusChip: vi.fn(),
  clearTypeFilters: vi.fn(),
  clearAgentFilters: vi.fn(),
  clearValueFilters: vi.fn(),
  clearStatusFilters: vi.fn(),
});

describe("ActiveFiltersSection", () => {
  let handlers: ReturnType<typeof createHandlers>;

  beforeEach(() => {
    handlers = createHandlers();
  });

  it("shows the empty state when there are no active filters", () => {
    render(<ActiveFiltersSection filter={{}} {...handlers} />);

    expect(screen.getByText("No filters applied")).toBeInTheDocument();
    expect(
      screen.getByText("Select filters from the tabs above to refine your results.")
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Clear all" })).not.toBeInTheDocument();
  });

  it("renders filter groups and delegates actions to the provided handlers", async () => {
    const filter = {
      type: ["service::Instance[test]"],
      agent: ["agent-1"],
      value: ["value-1"],
      status: ["deployed"],
    };

    render(<ActiveFiltersSection filter={filter} {...handlers} />);

    expect(screen.getByRole("heading", { name: "Active filters" })).toBeInTheDocument();
    expect(screen.getByText("Type")).toBeInTheDocument();
    expect(screen.getByText("Agent(s)")).toBeInTheDocument();
    expect(screen.getByText("Value")).toBeInTheDocument();
    expect(screen.getByText("Deploy State")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(handlers.onClearAll).toHaveBeenCalledTimes(1);

    await userEvent.click(
      screen.getByRole("button", {
        name: /Remove Type filters/,
      })
    );
    expect(handlers.clearTypeFilters).toHaveBeenCalledTimes(1);

    await userEvent.click(
      screen.getByRole("button", {
        name: /close service::Instance\[test\]/i,
      })
    );
    expect(handlers.removeTypeChip).toHaveBeenCalledWith("service::Instance[test]");

    await userEvent.click(
      screen.getByRole("button", {
        name: /close agent-1/i,
      })
    );
    expect(handlers.removeAgentChip).toHaveBeenCalledWith("agent-1");

    await userEvent.click(
      screen.getByRole("button", {
        name: /close value-1/i,
      })
    );
    expect(handlers.removeValueChip).toHaveBeenCalledWith("value-1");

    await userEvent.click(
      screen.getByRole("button", {
        name: /close deployed/i,
      })
    );
    expect(handlers.removeStatusChip).toHaveBeenCalledWith("deployed");
  });
});
