import React from "react";
import { render, screen } from "@testing-library/react";
import { Resource, Sort } from "@/Core";
import { DependencyProvider } from "@/UI/Dependency";
import { PrimaryRouteManager } from "@/UI/Routing";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import * as wordsModule from "@/UI/words";
import { ResourceRow } from "./ResourceTableRow";
import { ResourcesTable } from "./ResourcesTable";

const routeManager = PrimaryRouteManager("");

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

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <TestMemoryRouter initialEntries={["/"]}>
      <DependencyProvider dependencies={{ routeManager }}>{children}</DependencyProvider>
    </TestMemoryRouter>
  );
}

describe("ResourcesTable", () => {
  it("renders each row on initial mount", () => {
    const rows = [makeRow("a"), makeRow("b"), makeRow("c")];

    render(
      <Wrapper>
        <ResourcesTable rows={rows} sort={defaultSort} setSort={vi.fn()} />
      </Wrapper>
    );

    expect(screen.getByText("/tmp/a")).toBeInTheDocument();
    expect(screen.getByText("/tmp/b")).toBeInTheDocument();
    expect(screen.getByText("/tmp/c")).toBeInTheDocument();
  });

  it("skips re-renders when rows and sort references are stable", () => {
    const rows = [makeRow("a"), makeRow("b")];
    const setSort = vi.fn();
    const wordsSpy = vi.spyOn(wordsModule, "words");

    const { rerender } = render(
      <Wrapper>
        <ResourcesTable rows={rows} sort={defaultSort} setSort={setSort} />
      </Wrapper>
    );
    wordsSpy.mockClear();

    rerender(
      <Wrapper>
        <ResourcesTable rows={rows} sort={defaultSort} setSort={setSort} />
      </Wrapper>
    );

    expect(wordsSpy).not.toHaveBeenCalled();
    wordsSpy.mockRestore();
  });

  it("shows updated rows when the rows array reference changes", () => {
    const setSort = vi.fn();

    const { rerender } = render(
      <Wrapper>
        <ResourcesTable rows={[makeRow("a")]} sort={defaultSort} setSort={setSort} />
      </Wrapper>
    );

    expect(screen.queryByText("/tmp/b")).not.toBeInTheDocument();

    rerender(
      <Wrapper>
        <ResourcesTable rows={[makeRow("a"), makeRow("b")]} sort={defaultSort} setSort={setSort} />
      </Wrapper>
    );

    expect(screen.getByText("/tmp/b")).toBeInTheDocument();
  });
});
