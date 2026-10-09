import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Resource } from "@/Core";
import { words } from "@/UI";
import { ActiveFiltersSection } from "./ActiveFiltersSection";

const createHandlers = () => ({
  onResetFilters: vi.fn(),
  removeTypeChip: vi.fn(),
  removeAgentChip: vi.fn(),
  removeValueChip: vi.fn(),
  removeStatusChip: vi.fn(),
  clearTypeFilters: vi.fn(),
  clearAgentFilters: vi.fn(),
  clearValueFilters: vi.fn(),
  clearStatusFilters: vi.fn(),
  removeServiceEntityChip: vi.fn(),
  clearServiceEntities: vi.fn(),
  removeServiceInstanceChip: vi.fn(),
  clearServiceInstances: vi.fn(),
  removeIncludeOwned: vi.fn(),
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
    expect(screen.queryByRole("button", { name: "Reset Filters" })).toBeInTheDocument();
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
    expect(screen.getByText("Status")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Reset Filters" }));
    expect(handlers.onResetFilters).toHaveBeenCalledTimes(1);

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

  it("renders service scope chips and delegates their removal", async () => {
    const instanceValue = Resource.encodeServiceInstanceFilterValue(
      "e0f1b3d2-0000-0000-0000-000000000000",
      "demo-cpe-ring"
    );
    const filter = {
      serviceEntity: ["l2Connect"],
      serviceInstance: [instanceValue],
      includeOwned: true,
    };

    render(<ActiveFiltersSection filter={filter} {...handlers} />);

    expect(screen.getByText(words("resources.filters.service.entity.label"))).toBeInTheDocument();
    expect(screen.getByText(words("resources.filters.service.instance.label"))).toBeInTheDocument();
    expect(
      screen.getByText(words("resources.filters.service.includeOwned.label"))
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /close l2Connect/i }));
    expect(handlers.removeServiceEntityChip).toHaveBeenCalledWith("l2Connect");

    // The chip shows the resolved name, not the id, but removal carries the stored id|name value.
    expect(screen.queryByText("e0f1b3d2-0000-0000-0000-000000000000")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /close demo-cpe-ring/i }));
    expect(handlers.removeServiceInstanceChip).toHaveBeenCalledWith(instanceValue);

    await userEvent.click(
      screen.getByRole("button", {
        name: new RegExp(`close ${words("resources.filters.service.includeOwned.chipValue")}`, "i"),
      })
    );
    expect(handlers.removeIncludeOwned).toHaveBeenCalledTimes(1);
  });
});
