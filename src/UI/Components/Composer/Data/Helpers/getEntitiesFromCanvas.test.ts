import { getEntitiesFromCanvas, isServiceEntityShape, isServiceEntityShapeCell } from "./getEntitiesFromCanvas";
import { ServiceEntityShape } from "../../UI/JointJsShapes/ServiceEntityShape";
import { dia } from "@inmanta/rappid";
import { defineObjectsForJointJS } from "../../testSetup";

describe("getEntitiesFromCanvas", () => {
    beforeAll(() => {
        defineObjectsForJointJS();
    });

    describe("isServiceEntityShape", () => {
        it("should return true for ServiceEntityShape", () => {
            const mockElement = {
                attributes: { type: "app.ServiceEntityShape" },
            } as unknown as dia.Element;

            expect(isServiceEntityShape(mockElement)).toBe(true);
        });

        it("should return false for non-ServiceEntityShape", () => {
            const mockElement = {
                attributes: { type: "standard.Link" },
            } as unknown as dia.Element;

            expect(isServiceEntityShape(mockElement)).toBe(false);
        });
    });

    describe("isServiceEntityShapeCell", () => {
        it("should return true for ServiceEntityShape instance", () => {
            const mockCell = {
                constructor: { name: "ServiceEntityShape" },
            } as unknown as ServiceEntityShape;

            // Mock instanceof check
            Object.setPrototypeOf(mockCell, ServiceEntityShape.prototype);

            expect(isServiceEntityShapeCell(mockCell as dia.Cell)).toBe(true);
        });

        it("should return false for non-ServiceEntityShape cell", () => {
            const mockCell = {
                constructor: { name: "Link" },
            } as unknown as dia.Cell;

            expect(isServiceEntityShapeCell(mockCell)).toBe(false);
        });
    });

    describe("getEntitiesFromCanvas", () => {
        it("should return empty array when graph has no elements", () => {
            const graph = new dia.Graph();
            const result = getEntitiesFromCanvas(graph);

            expect(result).toEqual([]);
        });

        it("should return only ServiceEntityShape elements", () => {
            const graph = new dia.Graph();
            
            // Create mock ServiceEntityShape
            const shape1 = {
                id: "shape-1",
                attributes: { type: "app.ServiceEntityShape" },
            } as unknown as ServiceEntityShape;

            const shape2 = {
                id: "shape-2",
                attributes: { type: "app.ServiceEntityShape" },
            } as unknown as ServiceEntityShape;

            const link = {
                id: "link-1",
                attributes: { type: "standard.Link" },
            } as unknown as dia.Cell;

            // Mock getElements to return our test elements
            vi.spyOn(graph, "getElements").mockReturnValue([shape1, shape2, link] as dia.Element[]);

            const result = getEntitiesFromCanvas(graph);

            expect(result).toHaveLength(2);
            expect(result).toContain(shape1);
            expect(result).toContain(shape2);
        });

        it("should filter out non-ServiceEntityShape elements", () => {
            const graph = new dia.Graph();
            
            const link1 = {
                id: "link-1",
                attributes: { type: "standard.Link" },
            } as unknown as dia.Element;

            const link2 = {
                id: "link-2",
                attributes: { type: "standard.Link" },
            } as unknown as dia.Element;

            vi.spyOn(graph, "getElements").mockReturnValue([link1, link2]);

            const result = getEntitiesFromCanvas(graph);

            expect(result).toEqual([]);
        });
    });
});
