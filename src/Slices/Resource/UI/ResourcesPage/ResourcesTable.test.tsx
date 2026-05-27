import { render } from "@testing-library/react";
import { Resource, Sort } from "@/Core";
import { ResourceRow } from "./ResourceTableRow";
import { ResourcesTable } from "./ResourcesTable";

// Replace ResourceTableRow with a spy so ResourcesTable can be tested in
// isolation — no context providers needed, and render counts are exact.
const rowRenderSpy = vi.fn();

vi.mock("./ResourceTableRow", () => ({
  ResourceTableRow: (props: { row: ResourceRow }) => {
    rowRenderSpy(props.row.id);

    return (
      <tbody>
        <tr>
          <td data-testid={`row-${props.row.id}`}>{props.row.type}</td>
        </tr>
      </tbody>
    );
  },
}));

function makeRow(id: string): ResourceRow {
  return {
    id,
    type: "std::File",
    agent: "agent1",
    value: `/tmp/${id}`,
    requiresLength: 0,
    status: {
      isDeploying: false,
      isOrphan: false,
      lastHandlerRun: "SUCCESSFUL",
      compliance: "COMPLIANT",
      blocked: "NOT_BLOCKED",
    },
  };
}

const defaultSort: Sort.Type<Resource.SortKey> = { name: "resource_type", order: "asc" };

describe("ResourcesTable — re-render prevention", () => {
  beforeEach(() => rowRenderSpy.mockClear());

  it("renders each row once on initial mount", () => {
    const rows = [makeRow("a"), makeRow("b"), makeRow("c")];

    render(<ResourcesTable rows={rows} sort={defaultSort} setSort={vi.fn()} />);

    expect(rowRenderSpy).toHaveBeenCalledTimes(3);
    expect(rowRenderSpy).toHaveBeenNthCalledWith(1, "a");
    expect(rowRenderSpy).toHaveBeenNthCalledWith(2, "b");
    expect(rowRenderSpy).toHaveBeenNthCalledWith(3, "c");
  });

  it("skips all row re-renders when rows and sort references are stable", () => {
    const rows = [makeRow("a"), makeRow("b")];
    const setSort = vi.fn();

    const { rerender } = render(
      <ResourcesTable rows={rows} sort={defaultSort} setSort={setSort} />
    );
    rowRenderSpy.mockClear();

    // Simulate a polling refetch where parent re-renders but passes same references
    rerender(<ResourcesTable rows={rows} sort={defaultSort} setSort={setSort} />);

    expect(rowRenderSpy).not.toHaveBeenCalled();
  });

  it("re-renders all rows when the rows array reference changes", () => {
    const rows = [makeRow("a")];
    const setSort = vi.fn();

    const { rerender } = render(
      <ResourcesTable rows={rows} sort={defaultSort} setSort={setSort} />
    );
    rowRenderSpy.mockClear();

    const updated = [makeRow("a"), makeRow("b")];

    rerender(<ResourcesTable rows={updated} sort={defaultSort} setSort={setSort} />);

    expect(rowRenderSpy).toHaveBeenCalledTimes(2);
  });
});
