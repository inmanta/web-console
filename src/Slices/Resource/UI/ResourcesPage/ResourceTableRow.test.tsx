import React from "react";
import { render } from "@testing-library/react";
import { DependencyProvider } from "@/UI/Dependency";
import { PrimaryRouteManager } from "@/UI/Routing";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import * as wordsModule from "@/UI/words";
import { ResourceRow, ResourceTableRow } from "./ResourceTableRow";

const routeManager = PrimaryRouteManager("");

function makeRow(id: string, overrides: Partial<ResourceRow> = {}): ResourceRow {
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
    ...overrides,
  };
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <TestMemoryRouter initialEntries={["/"]}>
      <DependencyProvider dependencies={{ routeManager }}>{children}</DependencyProvider>
    </TestMemoryRouter>
  );
}

describe("ResourceTableRow — re-render prevention", () => {
  let wordsSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    wordsSpy = vi.spyOn(wordsModule, "words");
  });

  afterEach(() => {
    wordsSpy.mockRestore();
  });

  it("does not re-render when the parent re-renders with the same row reference", () => {
    const row = makeRow("1");

    function Parent({ version: _version }: { version: number }) {
      return (
        <Wrapper>
          <ResourceTableRow row={row} />
        </Wrapper>
      );
    }

    const { rerender } = render(<Parent version={1} />);
    wordsSpy.mockClear();

    rerender(<Parent version={2} />);

    expect(wordsSpy).not.toHaveBeenCalled();
  });

  it("re-renders when the row object reference changes", () => {
    function Parent({ row }: { row: ResourceRow }) {
      return (
        <Wrapper>
          <ResourceTableRow row={row} />
        </Wrapper>
      );
    }

    const { rerender } = render(<Parent row={makeRow("1")} />);
    wordsSpy.mockClear();

    rerender(<Parent row={makeRow("1", { type: "std::Directory" })} />);

    expect(wordsSpy).toHaveBeenCalled();
  });
});
