import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMockResourceSummary } from "@/Test/Data/Resource";
import { CompoundResourceStatus } from "./CompoundResourceStatus";

describe("CompoundResourceStatus", () => {
  it("renders an empty legend item for each status category when totalCount is 0", () => {
    render(
      <CompoundResourceStatus
        resourceSummary={createMockResourceSummary({ totalCount: 0 })}
        activeStatuses={[]}
        updateFilter={vi.fn()}
      />
    );

    const emptyItems = screen.getAllByLabelText("LegendItem-empty");
    expect(emptyItems).toHaveLength(3); // blocked, compliance, lastHandlerRun
  });

  it("renders the empty legend item at the same height as the filled items", () => {
    const { unmount } = render(
      <CompoundResourceStatus
        resourceSummary={createMockResourceSummary()}
        activeStatuses={[]}
        updateFilter={vi.fn()}
      />
    );

    const filledHeight = getComputedStyle(screen.getAllByLabelText(/^LegendItem-/)[0]).height;

    unmount();

    render(
      <CompoundResourceStatus
        resourceSummary={createMockResourceSummary({ totalCount: 0 })}
        activeStatuses={[]}
        updateFilter={vi.fn()}
      />
    );

    const emptyHeight = getComputedStyle(screen.getAllByLabelText("LegendItem-empty")[0]).height;

    expect(emptyHeight).not.toBe("");
    expect(emptyHeight).toBe(filledHeight);
  });

  it("renders all 3 legend bars when totalCount > 0", () => {
    render(
      <CompoundResourceStatus
        resourceSummary={createMockResourceSummary()}
        activeStatuses={[]}
        updateFilter={vi.fn()}
      />
    );

    expect(screen.getByTestId("legend-bar-blocked")).toBeInTheDocument();
    expect(screen.getByTestId("legend-bar-compliance")).toBeInTheDocument();
    expect(screen.getByTestId("legend-bar-lastHandlerRun")).toBeInTheDocument();
  });

  it("filters out items with value 0 from the bar", () => {
    render(
      <CompoundResourceStatus
        resourceSummary={createMockResourceSummary({
          blocked: {
            blocked: 1,
            not_blocked: 0,
            temporarily_blocked: 0,
          },
        })}
        activeStatuses={[]}
        updateFilter={vi.fn()}
      />
    );

    const bar = screen.getByTestId("legend-bar-blocked");

    expect(bar.querySelector("[data-testid='legend-bar-items']")?.children).toHaveLength(1);
  });

  it("adds the clicked status to the filter", async () => {
    const updateFilter = vi.fn();

    render(
      <CompoundResourceStatus
        resourceSummary={createMockResourceSummary()}
        activeStatuses={[]}
        updateFilter={updateFilter}
      />
    );

    await userEvent.click(screen.getByLabelText("LegendItem-blocked"));

    const updater = updateFilter.mock.calls[0][0];
    expect(updater({ status: ["!orphaned"] })).toEqual({ status: ["!orphaned", "blocked"] });
  });

  it("removes the clicked status from the filter when it is already active", async () => {
    const updateFilter = vi.fn();

    render(
      <CompoundResourceStatus
        resourceSummary={createMockResourceSummary()}
        activeStatuses={["!orphaned", "blocked"]}
        updateFilter={updateFilter}
      />
    );

    await userEvent.click(screen.getByLabelText("LegendItem-blocked"));

    const updater = updateFilter.mock.calls[0][0];
    expect(updater({ status: ["!orphaned", "blocked"] })).toEqual({ status: ["!orphaned"] });
  });

  it("marks only the segments that are in the active filter", () => {
    render(
      <CompoundResourceStatus
        resourceSummary={createMockResourceSummary()}
        activeStatuses={["!orphaned", "blocked", "compliant"]}
        updateFilter={vi.fn()}
      />
    );

    const activeSegments = screen
      .getAllByLabelText(/^LegendItem-/)
      .filter((segment) => segment.dataset.active === "true")
      .map((segment) => segment.getAttribute("aria-label"));

    expect(activeSegments).toEqual(["LegendItem-blocked", "LegendItem-compliant"]);
  });

  it("fades every segment outside the filter, across all bars", () => {
    render(
      <CompoundResourceStatus
        resourceSummary={createMockResourceSummary()}
        activeStatuses={["!orphaned", "failed"]}
        updateFilter={vi.fn()}
      />
    );

    screen.getAllByLabelText(/^LegendItem-/).forEach((segment) => {
      const isFailed = segment.getAttribute("aria-label") === "LegendItem-failed";

      expect(segment).toHaveStyle({ opacity: isFailed ? "1" : "0.35" });
    });
  });

  it("fades nothing when only statuses outside the bars are filtered", () => {
    render(
      <CompoundResourceStatus
        resourceSummary={createMockResourceSummary()}
        activeStatuses={["!orphaned", "isDeploying"]}
        updateFilter={vi.fn()}
      />
    );

    screen.getAllByLabelText(/^LegendItem-/).forEach((segment) => {
      expect(segment).toHaveStyle({ opacity: "1" });
    });
  });

  it("renders success statuses before danger statuses", () => {
    render(
      <CompoundResourceStatus
        resourceSummary={createMockResourceSummary({
          blocked: {
            blocked: 1,
            not_blocked: 1,
            temporarily_blocked: 0,
          },
        })}
        activeStatuses={[]}
        updateFilter={vi.fn()}
      />
    );
    const bar = screen.getByTestId("legend-bar-blocked");
    const segments = bar.querySelectorAll("[aria-label^='LegendItem-']");

    expect(segments[0].getAttribute("aria-label")).toBe("LegendItem-not_blocked");
    expect(segments[1].getAttribute("aria-label")).toBe("LegendItem-blocked");
  });
});
