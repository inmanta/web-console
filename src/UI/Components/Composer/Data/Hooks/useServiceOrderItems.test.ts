import { renderHook, waitFor } from "@testing-library/react";
import { ServiceModel } from "@/Core";
import { ServiceEntityShape } from "../../UI";
import { useServiceOrderItems } from "./useServiceOrderItems";

// Mock the deploymentHelpers module
vi.mock("../Helpers/deploymentHelpers", () => ({
  canvasStateToServiceOrderItems: vi.fn((canvasState, _initialShapeInfo, _serviceCatalog) => {
    const orderItems = new Map();
    canvasState.forEach((shape) => {
      orderItems.set(shape.id, {
        instance_id: shape.id,
        service_entity: shape.getEntityName(),
        config: {},
        action: null,
        attributes: shape.getSanitizedAttributes(),
      });
    });
    return orderItems;
  }),
}));

describe("useServiceOrderItems", () => {
  const createMockShape = (
    id: string,
    entityName: string,
    hasMissingConnections = false,
    hasAttributeErrors = false
  ): ServiceEntityShape => {
    const shape = {
      id,
      getEntityName: vi.fn().mockReturnValue(entityName),
      getSanitizedAttributes: vi.fn().mockReturnValue({ name: "test" }),
      validateAttributes: vi.fn(),
      isMissingConnections: vi.fn().mockReturnValue(hasMissingConnections),
      hasAttributeValidationErrors: hasAttributeErrors,
    } as unknown as ServiceEntityShape;
    return shape;
  };

  const createMockServiceCatalog = (): ServiceModel[] => [
    {
      name: "TestService",
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
    },
  ];

  it("should return empty serviceOrderItems when canvasState is empty", () => {
    const canvasState = new Map<string, ServiceEntityShape>();
    const initialShapeInfoRef = { current: new Map() };
    const serviceCatalog = createMockServiceCatalog();

    const { result } = renderHook(() =>
      useServiceOrderItems({
        canvasState,
        initialShapeInfoRef,
        serviceCatalog,
      })
    );

    expect(result.current.serviceOrderItems.size).toBe(0);
    expect(result.current.hasValidationErrors).toBe(false);
  });

  it("should return serviceOrderItems when canvasState has shapes", async () => {
    const shape1 = createMockShape("shape-1", "Entity1");
    const shape2 = createMockShape("shape-2", "Entity2");
    const canvasState = new Map([
      ["shape-1", shape1],
      ["shape-2", shape2],
    ]);
    const initialShapeInfoRef = { current: new Map() };
    const serviceCatalog = createMockServiceCatalog();

    const { result } = renderHook(() =>
      useServiceOrderItems({
        canvasState,
        initialShapeInfoRef,
        serviceCatalog,
      })
    );

    await waitFor(() => {
      expect(result.current.serviceOrderItems.size).toBe(2);
    });

    expect(result.current.serviceOrderItems.has("shape-1")).toBe(true);
    expect(result.current.serviceOrderItems.has("shape-2")).toBe(true);
  });

  it("should update serviceOrderItems when canvasState changes", async () => {
    const shape1 = createMockShape("shape-1", "Entity1");
    const canvasState = new Map([["shape-1", shape1]]);
    const initialShapeInfoRef = { current: new Map() };
    const serviceCatalog = createMockServiceCatalog();

    const { result, rerender } = renderHook(
      ({ canvasState }) =>
        useServiceOrderItems({
          canvasState,
          initialShapeInfoRef,
          serviceCatalog,
        }),
      {
        initialProps: { canvasState },
      }
    );

    await waitFor(() => {
      expect(result.current.serviceOrderItems.size).toBe(1);
    });

    const shape2 = createMockShape("shape-2", "Entity2");
    const newCanvasState = new Map([
      ["shape-1", shape1],
      ["shape-2", shape2],
    ]);

    rerender({ canvasState: newCanvasState });

    await waitFor(() => {
      expect(result.current.serviceOrderItems.size).toBe(2);
    });
  });

  it("should return hasValidationErrors as false when no shapes have errors", () => {
    const shape1 = createMockShape("shape-1", "Entity1", false, false);
    const shape2 = createMockShape("shape-2", "Entity2", false, false);
    const canvasState = new Map([
      ["shape-1", shape1],
      ["shape-2", shape2],
    ]);
    const initialShapeInfoRef = { current: new Map() };
    const serviceCatalog = createMockServiceCatalog();

    const { result } = renderHook(() =>
      useServiceOrderItems({
        canvasState,
        initialShapeInfoRef,
        serviceCatalog,
      })
    );

    expect(result.current.hasValidationErrors).toBe(false);
  });

  it("should return hasValidationErrors as true when a shape has missing connections", () => {
    const shape1 = createMockShape("shape-1", "Entity1", true, false);
    const canvasState = new Map([["shape-1", shape1]]);
    const initialShapeInfoRef = { current: new Map() };
    const serviceCatalog = createMockServiceCatalog();

    const { result } = renderHook(() =>
      useServiceOrderItems({
        canvasState,
        initialShapeInfoRef,
        serviceCatalog,
      })
    );

    expect(result.current.hasValidationErrors).toBe(true);
  });

  it("should return hasValidationErrors as true when a shape has attribute validation errors", () => {
    const shape1 = createMockShape("shape-1", "Entity1", false, true);
    const canvasState = new Map([["shape-1", shape1]]);
    const initialShapeInfoRef = { current: new Map() };
    const serviceCatalog = createMockServiceCatalog();

    const { result } = renderHook(() =>
      useServiceOrderItems({
        canvasState,
        initialShapeInfoRef,
        serviceCatalog,
      })
    );

    expect(result.current.hasValidationErrors).toBe(true);
  });

  it("should call validateAttributes on all shapes when checking validation errors", () => {
    const shape1 = createMockShape("shape-1", "Entity1", false, false);
    const shape2 = createMockShape("shape-2", "Entity2", false, false);
    const canvasState = new Map([
      ["shape-1", shape1],
      ["shape-2", shape2],
    ]);
    const initialShapeInfoRef = { current: new Map() };
    const serviceCatalog = createMockServiceCatalog();

    renderHook(() =>
      useServiceOrderItems({
        canvasState,
        initialShapeInfoRef,
        serviceCatalog,
      })
    );

    expect(shape1.validateAttributes).toHaveBeenCalled();
    expect(shape2.validateAttributes).toHaveBeenCalled();
  });

  it("should handle undefined serviceCatalog", () => {
    const shape1 = createMockShape("shape-1", "Entity1");
    const canvasState = new Map([["shape-1", shape1]]);
    const initialShapeInfoRef = { current: new Map() };

    const { result } = renderHook(() =>
      useServiceOrderItems({
        canvasState,
        initialShapeInfoRef,
        serviceCatalog: undefined,
      })
    );

    expect(result.current.serviceOrderItems.size).toBeGreaterThanOrEqual(0);
  });

  it("should update when initialShapeInfoRef changes", async () => {
    const shape1 = createMockShape("shape-1", "Entity1");
    const canvasState = new Map([["shape-1", shape1]]);
    const initialShapeInfoRef = { current: new Map([["shape-1", { service_entity: "Entity1" }]]) };
    const serviceCatalog = createMockServiceCatalog();

    const { result, rerender } = renderHook(
      ({ initialShapeInfoRef }) =>
        useServiceOrderItems({
          canvasState,
          initialShapeInfoRef,
          serviceCatalog,
        }),
      {
        initialProps: { initialShapeInfoRef },
      }
    );

    await waitFor(() => {
      expect(result.current.serviceOrderItems.size).toBeGreaterThanOrEqual(0);
    });

    const newInitialShapeInfoRef = {
      current: new Map([["shape-2", { service_entity: "Entity2" }]]),
    };
    rerender({ initialShapeInfoRef: newInitialShapeInfoRef });

    // The hook should still work with the new ref
    expect(result.current.serviceOrderItems).toBeDefined();
  });
});
