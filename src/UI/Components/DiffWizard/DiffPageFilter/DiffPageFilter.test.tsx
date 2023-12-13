import React from "react";
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
      />,
    );

    expect(container).toBeDefined();
  });

  it("updates search filter correctly", () => {
    const setSearchFilterMock = jest.fn();
    render(
      <DiffPageFilter
        statuses={mockStatuses}
        setStatuses={() => {}}
        setSearchFilter={setSearchFilterMock}
        searchFilter=""
      />,
    );

    const searchInput = screen.getByLabelText("SearchFilter");
    fireEvent.change(searchInput, { target: { value: "example" } });

    expect(setSearchFilterMock).toHaveBeenCalledWith("example");
  });
});
