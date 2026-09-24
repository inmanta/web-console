import React from "react";
import { render } from "@testing-library/react";
import { Resource } from "@/Core";
import { Resource as ResourceData } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { PrimaryRouteManager } from "@/UI/Routing";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import * as wordsModule from "@/UI/words";
import { ResourceTableRowView } from "./ResourceTableRow";

const routeManager = PrimaryRouteManager("");
const [{ node }] = ResourceData.response.data.resources.edges;

/** A resource from the mock fixture, shaped like the row fragment. */
function makeResource(overrides: Partial<Resource.Resource> = {}): Resource.Resource {
  return { ...node, ...overrides };
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <TestMemoryRouter initialEntries={["/"]}>
      <DependencyProvider dependencies={{ routeManager }}>{children}</DependencyProvider>
    </TestMemoryRouter>
  );
}

describe("ResourceTableRowView - re-render prevention", () => {
  let wordsSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    wordsSpy = vi.spyOn(wordsModule, "words");
  });

  afterEach(() => {
    wordsSpy.mockRestore();
  });

  it("does not re-render when the parent re-renders with the same resource reference", () => {
    const resource = makeResource();

    function Parent({ version: _version }: { version: number }) {
      return (
        <Wrapper>
          <ResourceTableRowView resource={resource} />
        </Wrapper>
      );
    }

    const { rerender } = render(<Parent version={1} />);
    wordsSpy.mockClear();

    rerender(<Parent version={2} />);

    expect(wordsSpy).not.toHaveBeenCalled();
  });

  it("re-renders when the resource object reference changes", () => {
    function Parent({ resource }: { resource: Resource.Resource }) {
      return (
        <Wrapper>
          <ResourceTableRowView resource={resource} />
        </Wrapper>
      );
    }

    const { rerender } = render(<Parent resource={makeResource()} />);
    wordsSpy.mockClear();

    rerender(<Parent resource={makeResource({ resourceType: "std::Directory" })} />);

    expect(wordsSpy).toHaveBeenCalled();
  });
});
