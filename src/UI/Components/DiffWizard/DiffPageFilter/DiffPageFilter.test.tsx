import { render, fireEvent, screen } from "@testing-library/react";
import { Diff } from "@/Core";
import { DiffPageFilter } from "./DiffPageFilter";

const mockStatuses: Diff.Status[] = ["added", "modified", "deleted"];

describe("DiffPageFilter", () => {
  it("renders without errors", async () => {
    const { container } = render(
      <DiffPageFilter
        statuses={mockStatuses}
        setStatuses={() => {}}
        setSearchFilter={() => {}}
        searchFilter=""
      />
    );

    expect(container).toBeDefined();
  });

  it("does not show unmodified as a filter option", () => {
    render(
      <DiffPageFilter
        statuses={Diff.defaultStatuses}
        setStatuses={() => {}}
        setSearchFilter={() => {}}
        searchFilter=""
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "StatusFilter" }));

    expect(screen.queryByRole("option", { name: "unmodified" })).toBeNull();
    Diff.defaultStatuses.forEach((status) => {
      expect(screen.getByRole("option", { name: status })).toBeInTheDocument();
    });
  });

  it("updates search filter correctly", () => {
    const setSearchFilterMock = vi.fn();

    render(
      <DiffPageFilter
        statuses={mockStatuses}
        setStatuses={() => {}}
        setSearchFilter={setSearchFilterMock}
        searchFilter=""
      />
    );

    const searchInput = screen.getByLabelText("SearchFilter");

    fireEvent.change(searchInput, { target: { value: "example" } });

    expect(setSearchFilterMock).toHaveBeenCalledWith("example");
  });
});
