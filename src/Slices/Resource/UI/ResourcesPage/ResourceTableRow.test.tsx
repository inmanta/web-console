import React from "react";
import { render } from "@testing-library/react";
import * as wordsModule from "@/UI/words";
import { ResourceRow, ResourceTableRow } from "./ResourceTableRow";

// Remove DependencyContext requirement from ResourceLink
vi.mock("@/UI/Components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/UI/Components")>();

  return {
    ...actual,
    ResourceLink: ({ resourceId }: { resourceId: string }) => (
      <a data-testid={`link-${resourceId}`}>link</a>
    ),
  };
});

// Mimic ResourceStateInfo so Popover's internal re-renders don't call words()
vi.mock("./ResourceStateInfo", () => ({
  ResourceStateInfo: () => <div data-testid="state-info" />,
}));

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

// Tbody requires a table ancestor for valid HTML
function TableWrapper({ children }: { children: React.ReactNode }) {
  return <table>{children}</table>;
}

describe("ResourceTableRow — re-render prevention", () => {
  // words() is called inline inside ResourceTableRow's render body (dataLabel,
  // aria-label, headerContent, link text). It's a reliable proxy for "did the
  // component function execute?" without fighting PF Popper's async positioning.
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
        <TableWrapper>
          <ResourceTableRow row={row} />
        </TableWrapper>
      );
    }

    const { rerender } = render(<Parent version={1} />);
    wordsSpy.mockClear();

    rerender(<Parent version={2} />);

    // memo bails out — component function doesn't execute
    expect(wordsSpy).not.toHaveBeenCalled();
  });

  it("re-renders when the row object reference changes", () => {
    function Parent({ row }: { row: ResourceRow }) {
      return (
        <TableWrapper>
          <ResourceTableRow row={row} />
        </TableWrapper>
      );
    }

    const { rerender } = render(<Parent row={makeRow("1")} />);
    wordsSpy.mockClear();

    rerender(<Parent row={makeRow("1", { type: "std::Directory" })} />);

    // New reference with changed data → memo sees change → component function executes
    expect(wordsSpy).toHaveBeenCalled();
  });
});
