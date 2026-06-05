import { dia, shapes, ui } from "@joint/plus";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ServiceModel, ServiceInstanceModel } from "@/Core";
import { InstanceWithRelations } from "@/Data/Queries";

import { updateAllMissingConnectionsHighlights } from "../../UI/JointJsShapes/createHalo";
import { defineObjectsForJointJS } from "../../testSetup";
import * as Helpers from "../Helpers";
import { RelationsDictionary } from "../Helpers/createRelationsDictionary";
import { useComposerGraph } from "./useComposerGraph";
import type { Mock } from "vitest";

// Mock ComposerPaper - must use function (not arrow) for Vitest 4 constructor compatibility.
// Kept here because it needs dia.Paper and the JointJS env from defineObjectsForJointJS (runs in beforeAll).
vi.mock("../../UI/JointJsShapes/ComposerPaper", () => ({
  ComposerPaper: vi.fn().mockImplementation(function (graph: dia.Graph) {
    // frozen: true mirrors the real ComposerPaper, so a recreated-but-never-unfrozen
    // paper is observable in tests via isFrozen().
    const paper = new dia.Paper({ model: graph, width: 800, height: 600, frozen: true });

    // Override unfreeze to only flip the frozen flag without triggering the
    // synchronous rendering batch (and thus 'render:done'). Without this,
    // unfreeze() would fire 'render:done' synchronously and consume the
    // paper.once() handler before a test can set up its spy.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (paper as any).unfreeze = () => { (paper as any)._frozen = false; return paper; };

    return { paper };
  }),
}));

// Mock requestAnimationFrame to prevent async issues
global.requestAnimationFrame = vi.fn((callback) => {
  setTimeout(callback, 0);

  return 1;
});

// Mock helper functions
vi.mock("../Helpers", () => ({
  initializeCanvasFromInstance: vi.fn().mockReturnValue(new Map()),
  createPlaceholderInstance: vi.fn().mockReturnValue({
    instance: {
      id: "placeholder-id",
      service_entity: "test-service",
      version: 0,
      environment: "",
      active_attributes: null,
      candidate_attributes: {},
      rollback_attributes: null,
      callback: [],
      deleted: false,
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString(),
      state: "creating",
      referenced_by: null,
    },
    interServiceRelations: [],
  }),
  applyCoordinatesFromMetadata: vi.fn(),
  applyAutoLayoutToEmbeddedEntities: vi.fn(),
}));

vi.mock("../../UI/JointJsShapes/createHalo", () => ({
  updateAllMissingConnectionsHighlights: vi.fn(),
}));

describe("useComposerGraph", () => {
  let editable: boolean;
  let serviceName: string;
  let instanceId: string | undefined;
  let serviceCatalog: ServiceModel[] | undefined;
  let mainService: ServiceModel | undefined;
  let relationsDictionary: RelationsDictionary;
  let instanceData: InstanceWithRelations | null;
  let isInstanceDataReady: boolean;
  let onCanvasStateInitialized: Mock;
  let onInitialShapeInfoTracked: Mock;

  const createMockService = (name: string): ServiceModel => ({
    name,
    environment: "test",
    lifecycle: {
      initial_state: "active",
      states: [],
      transfers: [],
    },
    attributes: [],
    config: {},
    embedded_entities: [],
    inter_service_relations: [],
    owned_entities: [],
    owner: null,
  });

  const createMockInstance = (
    id: string,
    serviceEntity: string,
    overrides: Partial<ServiceInstanceModel> = {}
  ): ServiceInstanceModel => ({
    id,
    service_entity: serviceEntity,
    version: 0,
    environment: "test-env",
    active_attributes: null,
    candidate_attributes: {},
    rollback_attributes: null,
    callback: [],
    deleted: false,
    last_updated: new Date().toISOString(),
    created_at: new Date().toISOString(),
    state: "up",
    referenced_by: null,
    ...overrides,
  });

  const createMockInstanceWithRelations = (
    instance: ServiceInstanceModel,
    interServiceRelations: ServiceInstanceModel[] = []
  ): InstanceWithRelations => ({
    instance,
    interServiceRelations,
  });

  beforeAll(() => {
    defineObjectsForJointJS();
  });

  beforeEach(() => {
    editable = true;
    serviceName = "test-service";
    instanceId = undefined;
    serviceCatalog = [createMockService("test-service")];
    mainService = serviceCatalog[0];
    relationsDictionary = {};
    instanceData = null;
    isInstanceDataReady = false;
    onCanvasStateInitialized = vi.fn() as Mock;
    onInitialShapeInfoTracked = vi.fn() as Mock;

    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it("should create graph, paper, and scroller", () => {
    const { result } = renderHook(() =>
      useComposerGraph({
        editable,
        serviceName,
        instanceId,
        serviceCatalog,
        mainService,
        relationsDictionary,
        instanceData,
        isInstanceDataReady,
        onCanvasStateInitialized,
        onInitialShapeInfoTracked,
      })
    );

    expect(result.current.graph).toBeInstanceOf(dia.Graph);
    expect(result.current.paper).toBeInstanceOf(dia.Paper);
    expect(result.current.scroller).toBeInstanceOf(ui.PaperScroller);

    // Mock zoomToFit to prevent DOM errors in subsequent tests
    vi.spyOn(result.current.scroller, "zoomToFit").mockReturnValue(result.current.scroller);
  });

  it("should not initialize when serviceCatalog is missing", () => {
    renderHook(() =>
      useComposerGraph({
        editable,
        serviceName,
        instanceId,
        serviceCatalog: undefined,
        mainService,
        relationsDictionary,
        instanceData,
        isInstanceDataReady,
        onCanvasStateInitialized,
        onInitialShapeInfoTracked,
      })
    );

    expect(Helpers.initializeCanvasFromInstance).not.toHaveBeenCalled();
  });

  it("should not initialize when mainService is missing", () => {
    renderHook(() =>
      useComposerGraph({
        editable,
        serviceName,
        instanceId,
        serviceCatalog,
        mainService: undefined,
        relationsDictionary,
        instanceData,
        isInstanceDataReady,
        onCanvasStateInitialized,
        onInitialShapeInfoTracked,
      })
    );

    expect(Helpers.initializeCanvasFromInstance).not.toHaveBeenCalled();
  });

  it("should create placeholder instance for new instance", async () => {
    const { result } = renderHook(() =>
      useComposerGraph({
        editable,
        serviceName,
        instanceId: undefined,
        serviceCatalog,
        mainService,
        relationsDictionary,
        instanceData,
        isInstanceDataReady,
        onCanvasStateInitialized,
        onInitialShapeInfoTracked,
      })
    );

    // Mock zoomToFit to prevent DOM errors
    vi.spyOn(result.current.scroller, "zoomToFit").mockReturnValue(result.current.scroller);

    await waitFor(() => {
      expect(Helpers.createPlaceholderInstance).toHaveBeenCalledWith(mainService, serviceCatalog);
    });

    expect(Helpers.initializeCanvasFromInstance).toHaveBeenCalled();
  });

  it("should wait for instance data when editing existing instance", async () => {
    // Clear any calls from previous tests
    vi.mocked(Helpers.initializeCanvasFromInstance).mockClear();

    renderHook(() =>
      useComposerGraph({
        editable,
        serviceName,
        instanceId: "existing-id",
        serviceCatalog,
        mainService,
        relationsDictionary,
        instanceData: null,
        isInstanceDataReady: false,
        onCanvasStateInitialized,
        onInitialShapeInfoTracked,
      })
    );

    // Wait a bit to ensure effect has run
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(Helpers.initializeCanvasFromInstance).not.toHaveBeenCalled();
  });

  it("should initialize from instance data when ready", async () => {
    const mockInstance = createMockInstance("existing-id", "test-service", {
      candidate_attributes: { name: "test" },
    });
    const mockInstanceData = createMockInstanceWithRelations(mockInstance);

    const { result } = renderHook(() =>
      useComposerGraph({
        editable,
        serviceName,
        instanceId: "existing-id",
        serviceCatalog,
        mainService,
        relationsDictionary,
        instanceData: mockInstanceData,
        isInstanceDataReady: true,
        onCanvasStateInitialized,
        onInitialShapeInfoTracked,
      })
    );

    // Mock zoomToFit to prevent DOM errors
    vi.spyOn(result.current.scroller, "zoomToFit").mockReturnValue(result.current.scroller);

    await waitFor(() => {
      expect(Helpers.initializeCanvasFromInstance).toHaveBeenCalledWith(
        mockInstanceData,
        serviceCatalog,
        relationsDictionary,
        expect.any(dia.Graph)
      );
    });
  });

  it("should call onCanvasStateInitialized with initialized entities", async () => {
    const mockEntities = new Map([
      ["entity-1", {}],
      ["entity-2", {}],
    ]);
    vi.mocked(Helpers.initializeCanvasFromInstance).mockReturnValue(
      mockEntities as unknown as ReturnType<typeof Helpers.initializeCanvasFromInstance>
    );

    const { result } = renderHook(() =>
      useComposerGraph({
        editable,
        serviceName,
        instanceId: undefined,
        serviceCatalog,
        mainService,
        relationsDictionary,
        instanceData,
        isInstanceDataReady,
        onCanvasStateInitialized,
        onInitialShapeInfoTracked,
      })
    );

    // Mock zoomToFit to prevent DOM errors
    vi.spyOn(result.current.scroller, "zoomToFit").mockReturnValue(result.current.scroller);

    await waitFor(() => {
      expect(onCanvasStateInitialized).toHaveBeenCalledWith(mockEntities);
    });
  });

  it("should track initial shape info for existing instances", async () => {
    const mockInstance = createMockInstance("existing-id", "test-service");
    const mockInstanceData = createMockInstanceWithRelations(mockInstance);
    const mockEntities = new Map([
      [
        "entity-1",
        {
          id: "entity-1",
          getEntityType: () => "Entity1Type",
          getEntityName: () => "Entity1",
        },
      ],
    ]);
    vi.mocked(Helpers.initializeCanvasFromInstance).mockReturnValue(
      mockEntities as unknown as ReturnType<typeof Helpers.initializeCanvasFromInstance>
    );

    const { result } = renderHook(() =>
      useComposerGraph({
        editable,
        serviceName,
        instanceId: "existing-id",
        serviceCatalog,
        mainService,
        relationsDictionary,
        instanceData: mockInstanceData,
        isInstanceDataReady: true,
        onCanvasStateInitialized,
        onInitialShapeInfoTracked,
      })
    );

    // Mock zoomToFit to prevent DOM errors
    vi.spyOn(result.current.scroller, "zoomToFit").mockReturnValue(result.current.scroller);

    await waitFor(() => {
      expect(onInitialShapeInfoTracked).toHaveBeenCalled();
    });

    const call = onInitialShapeInfoTracked.mock.calls[0][0];
    expect(call).toBeInstanceOf(Map);
    expect(call.has("entity-1")).toBe(true);
  });

  it("should not track initial shape info for new instances", async () => {
    const { result } = renderHook(() =>
      useComposerGraph({
        editable,
        serviceName,
        instanceId: undefined,
        serviceCatalog,
        mainService,
        relationsDictionary,
        instanceData,
        isInstanceDataReady,
        onCanvasStateInitialized,
        onInitialShapeInfoTracked,
      })
    );

    // Mock zoomToFit to prevent DOM errors
    vi.spyOn(result.current.scroller, "zoomToFit").mockReturnValue(result.current.scroller);

    await waitFor(() => {
      expect(onInitialShapeInfoTracked).toHaveBeenCalledWith(new Map());
    });
  });

  it("should apply coordinates from metadata when available", async () => {
    const mockInstance = createMockInstance("existing-id", "test-service", {
      metadata: {
        coordinates: JSON.stringify({
          version: "v2",
          data: { "entity-1": { x: 100, y: 200 } },
        }),
      },
    });
    const mockInstanceData = createMockInstanceWithRelations(mockInstance);

    const { result } = renderHook(() =>
      useComposerGraph({
        editable,
        serviceName,
        instanceId: "existing-id",
        serviceCatalog,
        mainService,
        relationsDictionary,
        instanceData: mockInstanceData,
        isInstanceDataReady: true,
        onCanvasStateInitialized,
        onInitialShapeInfoTracked,
      })
    );

    // Mock zoomToFit to prevent DOM errors
    vi.spyOn(result.current.scroller, "zoomToFit").mockReturnValue(result.current.scroller);

    await waitFor(() => {
      expect(Helpers.applyCoordinatesFromMetadata).toHaveBeenCalled();
    });
  });

  it("should apply auto layout to embedded entities", async () => {
    const { result } = renderHook(() =>
      useComposerGraph({
        editable,
        serviceName,
        instanceId: undefined,
        serviceCatalog,
        mainService,
        relationsDictionary,
        instanceData,
        isInstanceDataReady,
        onCanvasStateInitialized,
        onInitialShapeInfoTracked,
      })
    );

    // Mock zoomToFit to prevent DOM errors
    vi.spyOn(result.current.scroller, "zoomToFit").mockReturnValue(result.current.scroller);

    await waitFor(() => {
      expect(Helpers.applyAutoLayoutToEmbeddedEntities).toHaveBeenCalled();
    });
  });

  it("should not reinitialize when instance key hasn't changed", async () => {
    const mockInstance = createMockInstance("existing-id", "test-service");
    const mockInstanceData = createMockInstanceWithRelations(mockInstance);

    vi.mocked(Helpers.initializeCanvasFromInstance).mockImplementation(
      (_data, _catalog, _dict, graph) => {
        // Add a mock cell to the graph so graph.getCells().length > 0
        // Use a simple rectangle shape that has proper markup
        const mockCell = new shapes.standard.Rectangle({ id: "test-cell" });
        graph.addCell(mockCell);

        return new Map();
      }
    );

    const { result, rerender } = renderHook(
      ({ instanceId, instanceData, isInstanceDataReady }) =>
        useComposerGraph({
          editable,
          serviceName,
          instanceId,
          serviceCatalog,
          mainService,
          relationsDictionary,
          instanceData,
          isInstanceDataReady,
          onCanvasStateInitialized,
          onInitialShapeInfoTracked,
        }),
      {
        initialProps: {
          instanceId: "existing-id",
          instanceData: mockInstanceData,
          isInstanceDataReady: true,
        },
      }
    );

    // Mock zoomToFit to prevent DOM errors
    vi.spyOn(result.current.scroller, "zoomToFit").mockReturnValue(result.current.scroller);

    await waitFor(() => {
      expect(Helpers.initializeCanvasFromInstance).toHaveBeenCalled();
    });

    const initialCallCount = vi.mocked(Helpers.initializeCanvasFromInstance).mock.calls.length;

    // Rerender with same instanceId but different instanceData
    const updatedInstance = createMockInstance("existing-id", "test-service", {
      candidate_attributes: { name: "updated" },
    });
    const updatedInstanceData = createMockInstanceWithRelations(updatedInstance);
    rerender({
      instanceId: "existing-id",
      instanceData: updatedInstanceData,
      isInstanceDataReady: true,
    });

    // Wait a bit to ensure effect has run
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should not have been called again (same instance key, graph has cells)
    expect(Helpers.initializeCanvasFromInstance).toHaveBeenCalledTimes(initialCallCount);
  });

  it("should reinitialize when instance key changes", async () => {
    const mockInstance1 = createMockInstance("existing-id-1", "test-service");
    const mockInstanceData1 = createMockInstanceWithRelations(mockInstance1);

    const mockInstance2 = createMockInstance("existing-id-2", "test-service");
    const mockInstanceData2 = createMockInstanceWithRelations(mockInstance2);

    const { result, rerender } = renderHook(
      ({ instanceId, instanceData, isInstanceDataReady }) =>
        useComposerGraph({
          editable,
          serviceName,
          instanceId,
          serviceCatalog,
          mainService,
          relationsDictionary,
          instanceData,
          isInstanceDataReady,
          onCanvasStateInitialized,
          onInitialShapeInfoTracked,
        }),
      {
        initialProps: {
          instanceId: "existing-id-1",
          instanceData: mockInstanceData1,
          isInstanceDataReady: true,
        },
      }
    );

    // Mock zoomToFit to prevent DOM errors
    vi.spyOn(result.current.scroller, "zoomToFit").mockReturnValue(result.current.scroller);

    await waitFor(() => {
      expect(Helpers.initializeCanvasFromInstance).toHaveBeenCalled();
    });

    const initialCallCount = vi.mocked(Helpers.initializeCanvasFromInstance).mock.calls.length;

    // Rerender with different instanceId
    rerender({
      instanceId: "existing-id-2",
      instanceData: mockInstanceData2,
      isInstanceDataReady: true,
    });

    await waitFor(() => {
      // Should have been called at least one more time
      expect(vi.mocked(Helpers.initializeCanvasFromInstance).mock.calls.length).toBeGreaterThan(
        initialCallCount
      );
    });
  });

  it("should handle metadata parsing errors gracefully", async () => {
    const mockInstance = createMockInstance("existing-id", "test-service", {
      metadata: {
        coordinates: "invalid-json",
      },
    });
    const mockInstanceData = createMockInstanceWithRelations(mockInstance);

    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { result } = renderHook(() =>
      useComposerGraph({
        editable,
        serviceName,
        instanceId: "existing-id",
        serviceCatalog,
        mainService,
        relationsDictionary,
        instanceData: mockInstanceData,
        isInstanceDataReady: true,
        onCanvasStateInitialized,
        onInitialShapeInfoTracked,
      })
    );

    // Mock zoomToFit to prevent DOM errors
    vi.spyOn(result.current.scroller, "zoomToFit").mockReturnValue(result.current.scroller);

    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    consoleWarnSpy.mockRestore();
  });

  it("should center content and refresh highlights on the paper 'render:done' event", async () => {
    const { result } = renderHook(() =>
      useComposerGraph({
        editable,
        serviceName,
        instanceId: undefined,
        serviceCatalog,
        mainService,
        relationsDictionary,
        instanceData,
        isInstanceDataReady,
        onCanvasStateInitialized,
        onInitialShapeInfoTracked,
      })
    );

    // centerContent touches the DOM; stub it so we can assert it was invoked.
    const centerContentSpy = vi
      .spyOn(result.current.scroller, "centerContent")
      .mockImplementation(() => result.current.scroller);

    await waitFor(() => {
      expect(Helpers.initializeCanvasFromInstance).toHaveBeenCalled();
    });

    // The handler must not have run during mount: the synchronous mock paper
    // auto-fires 'render:done' from inside addCell (before the hook registers its
    // one-shot handler), so only an explicit trigger should drive centering.
    expect(centerContentSpy).not.toHaveBeenCalled();

    // The init effect registers a one-shot 'render:done' handler instead of a
    // setTimeout; simulate the async paper finishing its render batch. The event
    // carries an update-stats object; priority >= 2 keeps the PaperScroller's own
    // onPaperRenderDone from running its DOM-touching adjustPaper in jsdom.
    act(() => {
      result.current.paper.trigger("render:done", { priority: 2 });
    });

    expect(centerContentSpy).toHaveBeenCalledTimes(1);
    expect(vi.mocked(updateAllMissingConnectionsHighlights)).toHaveBeenCalledWith(
      result.current.paper
    );

    // The handler is one-shot (paper.once): a later 'render:done' must not yank
    // the view by re-centering. This guards against a regression to paper.on.
    act(() => {
      result.current.paper.trigger("render:done", { priority: 2 });
    });

    expect(centerContentSpy).toHaveBeenCalledTimes(1);
  });

  it("should dispose the paper and scroller on unmount, scroller before paper", () => {
    const { result, unmount } = renderHook(() =>
      useComposerGraph({
        editable,
        serviceName,
        instanceId: undefined,
        serviceCatalog,
        mainService,
        relationsDictionary,
        instanceData,
        isInstanceDataReady,
        onCanvasStateInitialized,
        onInitialShapeInfoTracked,
      })
    );

    const paperRemoveSpy = vi
      .spyOn(result.current.paper, "remove")
      .mockImplementation(() => result.current.paper);
    const scrollerRemoveSpy = vi
      .spyOn(result.current.scroller, "remove")
      .mockImplementation(() => result.current.scroller);

    unmount();

    expect(scrollerRemoveSpy).toHaveBeenCalledTimes(1);
    expect(paperRemoveSpy).toHaveBeenCalledTimes(1);
    // The scroller wraps the paper's element, so it must be removed first.
    expect(scrollerRemoveSpy.mock.invocationCallOrder[0]).toBeLessThan(
      paperRemoveSpy.mock.invocationCallOrder[0]
    );
  });

  it("should dispose the previous paper and scroller when they are recreated", () => {
    // Changing `editable` is a dependency of the paper useMemo, so the paper (and
    // therefore the scroller) is recreated. The cleanup effect must dispose the
    // old views — this is the leak path the teardown fixes for long-lived pages.
    const { result, rerender } = renderHook(
      ({ editable }) =>
        useComposerGraph({
          editable,
          serviceName,
          instanceId: undefined,
          serviceCatalog,
          mainService,
          relationsDictionary,
          instanceData,
          isInstanceDataReady,
          onCanvasStateInitialized,
          onInitialShapeInfoTracked,
        }),
      { initialProps: { editable: true } }
    );

    const firstPaper = result.current.paper;
    const firstScroller = result.current.scroller;
    const paperRemoveSpy = vi.spyOn(firstPaper, "remove").mockImplementation(() => firstPaper);
    const scrollerRemoveSpy = vi
      .spyOn(firstScroller, "remove")
      .mockImplementation(() => firstScroller);

    rerender({ editable: false });

    expect(result.current.paper).not.toBe(firstPaper);
    expect(result.current.scroller).not.toBe(firstScroller);
    expect(scrollerRemoveSpy).toHaveBeenCalledTimes(1);
    expect(paperRemoveSpy).toHaveBeenCalledTimes(1);
  });

  it("should keep the same, unfrozen paper when the service catalog reference changes mid-session", async () => {
    // Reproduces the frozen/blank-canvas scenario: while editing an existing instance
    // (so the graph holds cells), a 5s catalog refetch hands down a NEW serviceCatalog
    // array reference. With the buggy behavior the paper useMemo recreated a fresh
    // frozen paper, and the init effect early-returned (instance key unchanged + graph
    // has cells), leaving the canvas blank. The paper must stay the same, unfrozen
    // instance instead.
    vi.mocked(Helpers.initializeCanvasFromInstance).mockImplementation((_d, _c, _dict, graph) => {
      // Add a cell so graph.getCells().length > 0, which is what makes the init
      // effect take its early-return path on the second render.
      graph.addCell(new shapes.standard.Rectangle({ id: "existing-cell" }));

      return new Map();
    });

    const mockInstance = createMockInstance("existing-id", "test-service");
    const mockInstanceData = createMockInstanceWithRelations(mockInstance);

    const { result, rerender } = renderHook(
      ({ serviceCatalog }) =>
        useComposerGraph({
          editable,
          serviceName,
          instanceId: "existing-id",
          serviceCatalog,
          mainService,
          relationsDictionary,
          instanceData: mockInstanceData,
          isInstanceDataReady: true,
          onCanvasStateInitialized,
          onInitialShapeInfoTracked,
        }),
      { initialProps: { serviceCatalog } }
    );

    vi.spyOn(result.current.scroller, "zoomToFit").mockImplementation(
      () => result.current.scroller
    );
    vi.spyOn(result.current.scroller, "centerContent").mockImplementation(
      () => result.current.scroller
    );

    // After initialization the paper is unfrozen and rendering the instance.
    await waitFor(() => {
      expect(Helpers.initializeCanvasFromInstance).toHaveBeenCalled();
    });
    const firstPaper = result.current.paper;
    expect(firstPaper.isFrozen()).toBe(false);

    // A background catalog refetch hands down a new array reference (same content).
    rerender({ serviceCatalog: [...(serviceCatalog as ServiceModel[])] });

    // The paper must be the SAME instance and still rendering — not a fresh frozen one.
    expect(result.current.paper).toBe(firstPaper);
    expect(result.current.paper.isFrozen()).toBe(false);
  });
  
});
