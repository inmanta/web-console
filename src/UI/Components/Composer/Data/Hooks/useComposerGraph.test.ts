import { dia, shapes, ui } from "@inmanta/rappid";
import { renderHook, waitFor } from "@testing-library/react";
import { ServiceModel, ServiceInstanceModel } from "@/Core";
import { InstanceWithRelations } from "@/Data/Queries";

import { defineObjectsForJointJS } from "../../testSetup";
import * as Helpers from "../Helpers";
import { RelationsDictionary } from "../Helpers/createRelationsDictionary";
import { useComposerGraph } from "./useComposerGraph";

// Mock ComposerPaper - must use function (not arrow) for Vitest 4 constructor compatibility.
// Kept here because it needs dia.Paper and the JointJS env from defineObjectsForJointJS (runs in beforeAll).
vi.mock("../../UI/JointJsShapes/ComposerPaper", () => ({
  ComposerPaper: vi.fn().mockImplementation(function (
    graph: dia.Graph,
    _editable: boolean,
    _relationsDictionary: RelationsDictionary,
    _serviceCatalog: ServiceModel[]
  ) {
    const paper = new dia.Paper({ model: graph, width: 800, height: 600 });
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
  let onCanvasStateInitialized: ReturnType<typeof vi.fn>;
  let onInitialShapeInfoTracked: ReturnType<typeof vi.fn>;

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
    onCanvasStateInitialized = vi.fn();
    onInitialShapeInfoTracked = vi.fn();

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
    vi.spyOn(result.current.scroller, "zoomToFit").mockImplementation(() => {});
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
    vi.spyOn(result.current.scroller, "zoomToFit").mockImplementation(() => {});

    await waitFor(() => {
      expect(Helpers.createPlaceholderInstance).toHaveBeenCalledWith(mainService);
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
    vi.spyOn(result.current.scroller, "zoomToFit").mockImplementation(() => {});

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
    vi.mocked(Helpers.initializeCanvasFromInstance).mockReturnValue(mockEntities);

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
    vi.spyOn(result.current.scroller, "zoomToFit").mockImplementation(() => {});

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
          getEntityName: () => "Entity1",
        },
      ],
    ]);
    vi.mocked(Helpers.initializeCanvasFromInstance).mockReturnValue(mockEntities);

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
    vi.spyOn(result.current.scroller, "zoomToFit").mockImplementation(() => {});

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
    vi.spyOn(result.current.scroller, "zoomToFit").mockImplementation(() => {});

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
    vi.spyOn(result.current.scroller, "zoomToFit").mockImplementation(() => {});

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
    vi.spyOn(result.current.scroller, "zoomToFit").mockImplementation(() => {});

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
    vi.spyOn(result.current.scroller, "zoomToFit").mockImplementation(() => {});

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
    vi.spyOn(result.current.scroller, "zoomToFit").mockImplementation(() => {});

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
    vi.spyOn(result.current.scroller, "zoomToFit").mockImplementation(() => {});

    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    consoleWarnSpy.mockRestore();
  });
});
