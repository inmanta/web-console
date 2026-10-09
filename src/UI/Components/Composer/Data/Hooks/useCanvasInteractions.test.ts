import { dia, shapes, ui } from "@joint/plus";
import { act, renderHook } from "@testing-library/react";
import { ServiceModel } from "@/Core";
import { defineObjectsForJointJS } from "../../testSetup";
import { RelationsDictionary } from "../Helpers";
import { useCanvasInteractions } from "./useCanvasInteractions";

// The halo scales via the `--composer-zoom` CSS variable on the paper element. These
// tests lock in that the hook keeps that variable in sync with the paper's zoom, since
// the CSS in ComposerContainer relies on it inheriting into `.joint-halo`.
describe("useCanvasInteractions zoom variable", () => {
  let graph: dia.Graph;
  let paper: dia.Paper;

  const renderInteractions = () =>
    renderHook(() =>
      useCanvasInteractions({
        paper,
        graph,
        // Only truthiness matters here; the panning handler that uses the scroller is
        // never triggered in these tests.
        scroller: {} as ui.PaperScroller,
        editable: true,
        relationsDictionary: {} as RelationsDictionary,
        activeCell: null,
        setActiveCell: vi.fn(),
        setFormState: vi.fn(),
        initialShapeInfoRef: { current: new Map() },
        serviceCatalog: [] as ServiceModel[],
      })
    );

  beforeAll(() => {
    defineObjectsForJointJS();
  });

  beforeEach(() => {
    graph = new dia.Graph({}, { cellNamespace: shapes });
    paper = new dia.Paper({ model: graph, width: 800, height: 600 });
  });

  it("syncs --composer-zoom to the current paper scale on mount", () => {
    paper.scale(0.5, 0.5);

    renderInteractions();

    expect(paper.el.style.getPropertyValue("--composer-zoom")).toBe("0.5");
  });

  it("updates --composer-zoom when the paper is zoomed", () => {
    renderInteractions();

    act(() => {
      paper.scale(1.5, 1.5);
    });

    expect(paper.el.style.getPropertyValue("--composer-zoom")).toBe("1.5");
  });
});
