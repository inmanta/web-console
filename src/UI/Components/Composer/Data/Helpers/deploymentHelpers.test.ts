import {
    getCellsCoordinates,
    canvasStateToServiceOrderItems,
    getServiceOrderItemsArray,
    ComposerServiceOrderItem,
} from "./deploymentHelpers";
import { ServiceEntityShape } from "../../UI/JointJsShapes/ServiceEntityShape";
import { dia } from "@inmanta/rappid";
import { defineObjectsForJointJS } from "../../testSetup";

describe("deploymentHelpers", () => {
    beforeAll(() => {
        defineObjectsForJointJS();
    });

    const createMockShape = (
        id: string,
        entityName: string,
        orderItem: ComposerServiceOrderItem | null = null
    ): ServiceEntityShape => {
        return {
            id,
            getEntityName: vi.fn().mockReturnValue(entityName),
            updateOrderItem: vi.fn(),
            orderItem,
            get: vi.fn().mockReturnValue("app.ServiceEntityShape"),
            position: vi.fn().mockReturnValue({ x: 100, y: 200 }),
        } as unknown as ServiceEntityShape;
    };

    describe("getCellsCoordinates", () => {
        it("should return empty array when graph has no cells", () => {
            const graph = new dia.Graph();
            vi.spyOn(graph, "getCells").mockReturnValue([]);

            const result = getCellsCoordinates(graph);

            expect(result).toEqual([]);
        });

        it("should return coordinates for ServiceEntityShape cells", () => {
            const graph = new dia.Graph();
            const shape1 = createMockShape("shape-1", "ServiceA");
            const shape2 = createMockShape("shape-2", "ServiceB");
            const link = {
                id: "link-1",
                get: vi.fn().mockReturnValue("standard.Link"),
                position: vi.fn().mockReturnValue({ x: 50, y: 50 }),
            } as unknown as dia.Cell;

            vi.spyOn(graph, "getCells").mockReturnValue([shape1, shape2, link] as dia.Cell[]);

            const result = getCellsCoordinates(graph);

            expect(result).toHaveLength(2);
            expect(result).toEqual([
                { id: "shape-1", coordinates: { x: 100, y: 200 } },
                { id: "shape-2", coordinates: { x: 100, y: 200 } },
            ]);
        });

        it("should filter out non-ServiceEntityShape cells", () => {
            const graph = new dia.Graph();
            const link1 = {
                id: "link-1",
                get: vi.fn().mockReturnValue("standard.Link"),
                position: vi.fn().mockReturnValue({ x: 50, y: 50 }),
            } as unknown as dia.Cell;

            vi.spyOn(graph, "getCells").mockReturnValue([link1]);

            const result = getCellsCoordinates(graph);

            expect(result).toEqual([]);
        });
    });

    describe("canvasStateToServiceOrderItems", () => {
        it("should return empty map when canvasState is empty", () => {
            const canvasState = new Map<string, ServiceEntityShape>();
            const initialShapeInfo = new Map();
            const serviceCatalog: Array<{ name: string }> = [];

            const result = canvasStateToServiceOrderItems(canvasState, initialShapeInfo, serviceCatalog);

            expect(result.size).toBe(0);
        });

        it("should convert shapes to service order items", () => {
            const canvasState = new Map<string, ServiceEntityShape>();
            const orderItem1: ComposerServiceOrderItem = {
                instance_id: "shape-1",
                service_entity: "ServiceA",
                config: {},
                action: "create",
                attributes: { name: "test" },
            };
            const orderItem2: ComposerServiceOrderItem = {
                instance_id: "shape-2",
                service_entity: "ServiceB",
                config: {},
                action: "update",
                attributes: { name: "test2" },
            };

            const shape1 = createMockShape("shape-1", "ServiceA", orderItem1);
            const shape2 = createMockShape("shape-2", "ServiceB", orderItem2);

            canvasState.set("shape-1", shape1);
            canvasState.set("shape-2", shape2);

            const result = canvasStateToServiceOrderItems(canvasState);

            expect(result.size).toBe(2);
            expect(result.get("shape-1")).toEqual(orderItem1);
            expect(result.get("shape-2")).toEqual(orderItem2);
            expect(shape1.updateOrderItem).toHaveBeenCalled();
            expect(shape2.updateOrderItem).toHaveBeenCalled();
        });

        it("should add delete items for removed shapes", () => {
            const canvasState = new Map<string, ServiceEntityShape>();
            const initialShapeInfo = new Map<string, { service_entity: string }>();
            initialShapeInfo.set("deleted-shape-1", { service_entity: "ServiceA" });
            initialShapeInfo.set("deleted-shape-2", { service_entity: "ServiceB" });

            const result = canvasStateToServiceOrderItems(canvasState, initialShapeInfo);

            expect(result.size).toBe(2);
            expect(result.get("deleted-shape-1")).toEqual({
                instance_id: "deleted-shape-1",
                service_entity: "ServiceA",
                config: {},
                action: "delete",
                attributes: null,
                edits: null,
            });
            expect(result.get("deleted-shape-2")).toEqual({
                instance_id: "deleted-shape-2",
                service_entity: "ServiceB",
                config: {},
                action: "delete",
                attributes: null,
                edits: null,
            });
        });

        it("should handle both existing and deleted shapes", () => {
            const canvasState = new Map<string, ServiceEntityShape>();
            const orderItem: ComposerServiceOrderItem = {
                instance_id: "shape-1",
                service_entity: "ServiceA",
                config: {},
                action: "create",
                attributes: { name: "test" },
            };
            const shape1 = createMockShape("shape-1", "ServiceA", orderItem);
            canvasState.set("shape-1", shape1);

            const initialShapeInfo = new Map<string, { service_entity: string }>();
            initialShapeInfo.set("shape-1", { service_entity: "ServiceA" });
            initialShapeInfo.set("deleted-shape-1", { service_entity: "ServiceB" });

            const result = canvasStateToServiceOrderItems(canvasState, initialShapeInfo);

            expect(result.size).toBe(2);
            expect(result.get("shape-1")).toEqual(orderItem);
            expect(result.get("deleted-shape-1")?.action).toBe("delete");
        });

        it("should skip shapes without orderItem", () => {
            const canvasState = new Map<string, ServiceEntityShape>();
            const shape1 = createMockShape("shape-1", "ServiceA", null);
            canvasState.set("shape-1", shape1);

            const result = canvasStateToServiceOrderItems(canvasState);

            expect(result.size).toBe(0);
        });
    });

    describe("getServiceOrderItemsArray", () => {
        it("should return empty array when map is empty", () => {
            const serviceOrderItems = new Map<string, ComposerServiceOrderItem>();

            const result = getServiceOrderItemsArray(serviceOrderItems);

            expect(result).toEqual([]);
        });

        it("should filter out items with null actions", () => {
            const serviceOrderItems = new Map<string, ComposerServiceOrderItem>();
            serviceOrderItems.set("item-1", {
                instance_id: "item-1",
                service_entity: "ServiceA",
                config: {},
                action: null,
                attributes: { name: "test" },
            });
            serviceOrderItems.set("item-2", {
                instance_id: "item-2",
                service_entity: "ServiceB",
                config: {},
                action: "create",
                attributes: { name: "test2" },
            });

            const result = getServiceOrderItemsArray(serviceOrderItems);

            expect(result).toHaveLength(1);
            expect(result[0].instance_id).toBe("item-2");
        });

        it("should transform update items to use edits format", () => {
            const serviceOrderItems = new Map<string, ComposerServiceOrderItem>();
            serviceOrderItems.set("item-1", {
                instance_id: "item-1",
                service_entity: "ServiceA",
                config: {},
                action: "update",
                attributes: { name: "test", port: 8080 },
                edits: null,
            });

            const result = getServiceOrderItemsArray(serviceOrderItems);

            expect(result).toHaveLength(1);
            expect(result[0].action).toBe("update");
            expect(result[0].attributes).toBeUndefined();
            expect(result[0].edits).toBeDefined();
            expect(result[0].edits).toHaveLength(1);
            expect(result[0].edits![0].operation).toBe("replace");
            expect(result[0].edits![0].target).toBe(".");
            expect(result[0].edits![0].value).toEqual({ name: "test", port: 8080 });
        });

        it("should not transform update items that already have edits", () => {
            const serviceOrderItems = new Map<string, ComposerServiceOrderItem>();
            const existingEdits = [
                {
                    edit_id: "existing-edit",
                    operation: "replace",
                    target: ".",
                    value: { name: "test" },
                },
            ] as [Record<string, unknown>];

            serviceOrderItems.set("item-1", {
                instance_id: "item-1",
                service_entity: "ServiceA",
                config: {},
                action: "update",
                attributes: { name: "test" },
                edits: existingEdits,
            });

            const result = getServiceOrderItemsArray(serviceOrderItems);

            expect(result).toHaveLength(1);
            expect(result[0].edits).toBe(existingEdits);
        });

        it("should not transform non-update items", () => {
            const serviceOrderItems = new Map<string, ComposerServiceOrderItem>();
            serviceOrderItems.set("item-1", {
                instance_id: "item-1",
                service_entity: "ServiceA",
                config: {},
                action: "create",
                attributes: { name: "test" },
            });

            const result = getServiceOrderItemsArray(serviceOrderItems);

            expect(result).toHaveLength(1);
            expect(result[0].attributes).toEqual({ name: "test" });
            expect(result[0].edits).toBeUndefined();
        });
    });
});
