import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CompoundResourceStatus } from "./CompoundResourceStatus";
import { mockCompoundResourceData } from "./mockData";

const defaultProps = {
  ...mockCompoundResourceData,
  updateFilter: vi.fn(),
};

describe("CompoundResourceStatus", () => {
  it("renders nothing when totalCount is 0", () => {
    const { container } = render(<CompoundResourceStatus {...defaultProps} totalCount={0} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders all 3 legend bars when totalCount > 0", () => {
    render(<CompoundResourceStatus {...defaultProps} />);

    expect(screen.getByTestId("legend-bar-blocked")).toBeInTheDocument();
    expect(screen.getByTestId("legend-bar-compliance")).toBeInTheDocument();
    expect(screen.getByTestId("legend-bar-last-handler-run")).toBeInTheDocument();
  });

  it("filters out items with value 0 from the bar", () => {
    render(
      <CompoundResourceStatus
        {...defaultProps}
        blocked={{ blocked: 1, not_blocked: 0, temporarily_blocked: 0 }}
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
        blocked={{ blocked: 1, not_blocked: 1, temporarily_blocked: 0 }}
      />
    );
    const bar = screen.getByTestId("legend-bar-blocked");
    const segments = bar.querySelectorAll("[aria-label^='LegendItem-']");

    expect(segments[0].getAttribute("aria-label")).toBe("LegendItem-not_blocked");
    expect(segments[1].getAttribute("aria-label")).toBe("LegendItem-blocked");
  });
});
