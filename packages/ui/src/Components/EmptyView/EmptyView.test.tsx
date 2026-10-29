import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { words } from "@inmanta/web-console-core";
import { EmptyView } from "./EmptyView";

describe("EmptyView", () => {
  it("shows the title and message without a Reset Filters button without onResetFilters", () => {
    render(<EmptyView message="No agents found" />);

    expect(screen.getByRole("heading", { name: words("empty.title") })).toBeInTheDocument();
    expect(screen.getByText("No agents found")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: words("resources.filters.active.resetFilters") })
    ).not.toBeInTheDocument();
  });

  it("shows the no results variant with onResetFilters", () => {
    render(<EmptyView title="No events" message="No agents found" onResetFilters={vi.fn()} />);

    expect(
      screen.getByRole("heading", { name: words("empty.filtered.title") })
    ).toBeInTheDocument();
    expect(screen.getByText(words("empty.filtered.message"))).toBeInTheDocument();
    expect(screen.queryByText("No agents found")).not.toBeInTheDocument();
  });

  it("calls onResetFilters when the Reset Filters button is pressed", async () => {
    const handleResetFilters = vi.fn();

    render(<EmptyView message="No agents found" onResetFilters={handleResetFilters} />);

    await userEvent.click(
      screen.getByRole("button", { name: words("resources.filters.active.resetFilters") })
    );

    expect(handleResetFilters).toHaveBeenCalledTimes(1);
  });
});
