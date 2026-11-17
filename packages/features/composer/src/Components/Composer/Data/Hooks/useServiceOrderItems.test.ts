import { renderHook, waitFor } from "@testing-library/react";
import { ServiceEntityShape } from "../ServiceEntityShape";
import { useServiceOrderItems } from "./useServiceOrderItems";

// Mock the deploymentHelpers module
vi.mock("../Helpers/deploymentHelpers", () => ({
  canvasStateToServiceOrderItems: vi.fn((canvasState) => {
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

  it("should return empty serviceOrderItems when canvasState is empty", () => {
    const canvasState = new Map<string, ServiceEntityShape>();

    const { result } = renderHook(() =>
      useServiceOrderItems({
        canvasState,
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

    const { result } = renderHook(() =>
      useServiceOrderItems({
        canvasState,
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

    const { result, rerender } = renderHook(
      ({ canvasState }) =>
        useServiceOrderItems({
          canvasState,
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

    const { result } = renderHook(() =>
      useServiceOrderItems({
        canvasState,
      })
    );

    expect(result.current.hasValidationErrors).toBe(false);
  });

  it("should return hasValidationErrors as true when a shape has missing connections", () => {
    const shape1 = createMockShape("shape-1", "Entity1", true, false);
    const canvasState = new Map([["shape-1", shape1]]);

    const { result } = renderHook(() =>
      useServiceOrderItems({
        canvasState,
      })
    );

    expect(result.current.hasValidationErrors).toBe(true);
  });

  it("should return hasValidationErrors as true when a shape has attribute validation errors", () => {
    const shape1 = createMockShape("shape-1", "Entity1", false, true);
    const canvasState = new Map([["shape-1", shape1]]);

    const { result } = renderHook(() =>
      useServiceOrderItems({
        canvasState,
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

    renderHook(() =>
      useServiceOrderItems({
        canvasState,
      })
    );

    expect(shape1.validateAttributes).toHaveBeenCalled();
    expect(shape2.validateAttributes).toHaveBeenCalled();
  });
});
