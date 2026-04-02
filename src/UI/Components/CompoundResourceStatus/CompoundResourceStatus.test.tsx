import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockCompoundResourceData } from "@/Test/Data/Resource";
import { CompoundResourceProps, CompoundResourceStatus } from "./CompoundResourceStatus";

const defaultProps: CompoundResourceProps = {
  ...mockCompoundResourceData,
  updateFilter: vi.fn(),
};

describe("CompoundResourceStatus", () => {
  it("renders an empty legend item for each status category when totalCount is 0", () => {
    const { getAllByLabelText } = render(
      <CompoundResourceStatus {...defaultProps} totalCount={0} />
    );
    const emptyItems = getAllByLabelText("LegendItem-empty");
    expect(emptyItems).toHaveLength(Object.keys(defaultProps.compoundState).length);
  });

  it("renders all 3 legend bars when totalCount > 0", () => {
    render(<CompoundResourceStatus {...defaultProps} />);

    expect(screen.getByTestId("legend-bar-blocked")).toBeInTheDocument();
    expect(screen.getByTestId("legend-bar-compliance")).toBeInTheDocument();
    expect(screen.getByTestId("legend-bar-lastHandlerRun")).toBeInTheDocument();
  });

  it("filters out items with value 0 from the bar", () => {
    render(
      <CompoundResourceStatus
        {...defaultProps}
        compoundState={{
          ...defaultProps.compoundState,
          blocked: { blocked: 1, not_blocked: 0, temporarily_blocked: 0 },
        }}
      />
    );
    const bar = screen.getByTestId("legend-bar-blocked");
    expect(bar.querySelector("[data-testid='legend-bar-items']")?.children).toHaveLength(1);
  });

  it("calls updateFilter with correct status on item click", async () => {
    const updateFilter = vi.fn();
    render(<CompoundResourceStatus {...defaultProps} updateFilter={updateFilter} />);

    const bar = screen.getByTestId("legend-bar-blocked");
    const firstSegment = bar.querySelector("[aria-label^='LegendItem-']") as HTMLElement;

    await userEvent.click(firstSegment);

    expect(updateFilter).toHaveBeenCalled();

    const updater = updateFilter.mock.calls[0][0];
    const result = updater({ status: [] });
    expect(result.status).toHaveLength(1);
    expect(typeof result.status[0]).toBe("string");
  });

  it("renders success statuses before danger statuses", () => {
    render(
      <CompoundResourceStatus
        {...defaultProps}
        compoundState={{
          ...defaultProps.compoundState,
          blocked: { blocked: 1, not_blocked: 1, temporarily_blocked: 0 },
        }}
      />
    );
    const bar = screen.getByTestId("legend-bar-blocked");
    const segments = bar.querySelectorAll("[aria-label^='LegendItem-']");

    expect(segments[0].getAttribute("aria-label")).toBe("LegendItem-not_blocked");
    expect(segments[1].getAttribute("aria-label")).toBe("LegendItem-blocked");
  });
});
