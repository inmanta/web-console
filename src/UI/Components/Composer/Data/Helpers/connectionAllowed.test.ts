import { checkIfConnectionIsAllowed } from "./connectionAllowed";
import { ServiceEntityShape } from "../../UI/JointJsShapes/ServiceEntityShape";
import { RelationsDictionary } from "./createRelationsDictionary";
import { dia } from "@inmanta/rappid";
import { defineObjectsForJointJS } from "../../testSetup";

describe("checkIfConnectionIsAllowed", () => {
    beforeAll(() => {
        defineObjectsForJointJS();
    });

    const createMockShape = (
        id: string,
        entityName: string,
        validateConnectionResult: boolean = true
    ): ServiceEntityShape => {
        const shape = {
            id,
            getEntityName: vi.fn().mockReturnValue(entityName),
            validateConnection: vi.fn().mockReturnValue(validateConnectionResult),
        } as unknown as ServiceEntityShape;
        // Make it pass instanceof checks
        Object.setPrototypeOf(shape, ServiceEntityShape.prototype);
        return shape;
    };

    const createMockView = (model: ServiceEntityShape): dia.CellView => {
        return {
            model,
        } as unknown as dia.CellView;
    };

    const createMockGraph = (neighbors: dia.Element[] = []): dia.Graph => {
        return {
            getNeighbors: vi.fn().mockReturnValue(neighbors),
        } as unknown as dia.Graph;
    };

    it("should return false when targetView is undefined", () => {
        const graph = createMockGraph();
        const sourceView = createMockView(createMockShape("source-1", "ServiceA"));
        const relationsDictionary: RelationsDictionary = {};

        const result = checkIfConnectionIsAllowed(graph, undefined, sourceView, relationsDictionary);

        expect(result).toBe(false);
    });

    it("should return false when source is not a ServiceEntityShape", () => {
        const graph = createMockGraph();
        const sourceView = {
            model: { id: "source-1" },
        } as unknown as dia.CellView;
        const targetView = createMockView(createMockShape("target-1", "ServiceB"));
        const relationsDictionary: RelationsDictionary = {};

        const result = checkIfConnectionIsAllowed(graph, targetView, sourceView, relationsDictionary);

        expect(result).toBe(false);
    });

    it("should return false when target is not a ServiceEntityShape", () => {
        const graph = createMockGraph();
        const sourceView = createMockView(createMockShape("source-1", "ServiceA"));
        const targetView = {
            model: { id: "target-1" },
        } as unknown as dia.CellView;
        const relationsDictionary: RelationsDictionary = {};

        const result = checkIfConnectionIsAllowed(graph, targetView, sourceView, relationsDictionary);

        expect(result).toBe(false);
    });

    it("should return false when source and target are the same", () => {
        const graph = createMockGraph();
        const shape = createMockShape("same-1", "ServiceA");
        const sourceView = createMockView(shape);
        const targetView = createMockView(shape);
        const relationsDictionary: RelationsDictionary = {
            ServiceA: { ServiceB: { lower_limit: 1, upper_limit: 1 } },
        };

        const result = checkIfConnectionIsAllowed(graph, targetView, sourceView, relationsDictionary);

        expect(result).toBe(false);
    });

    it("should return false when no relations exist in dictionary", () => {
        const graph = createMockGraph();
        const sourceView = createMockView(createMockShape("source-1", "ServiceA"));
        const targetView = createMockView(createMockShape("target-1", "ServiceB"));
        const relationsDictionary: RelationsDictionary = {};

        const result = checkIfConnectionIsAllowed(graph, targetView, sourceView, relationsDictionary);

        expect(result).toBe(false);
    });

    it("should return false when shapes are already connected", () => {
        const targetShape = createMockShape("target-1", "ServiceB");
        const sourceShape = createMockShape("source-1", "ServiceA");
        const graph = createMockGraph([targetShape as unknown as dia.Element]);
        const sourceView = createMockView(sourceShape);
        const targetView = createMockView(targetShape);
        const relationsDictionary: RelationsDictionary = {
            ServiceA: { ServiceB: { lower_limit: 1, upper_limit: 1 } },
            ServiceB: { ServiceA: { lower_limit: 1, upper_limit: 1 } },
        };

        const result = checkIfConnectionIsAllowed(graph, targetView, sourceView, relationsDictionary);

        expect(result).toBe(false);
        // getNeighbors is called with sourceElement (sourceModel cast to dia.Element)
        expect(graph.getNeighbors).toHaveBeenCalled();
    });

    it("should return true when connection is allowed from both sides", () => {
        const sourceShape = createMockShape("source-1", "ServiceA", true);
        const targetShape = createMockShape("target-1", "ServiceB", true);
        const graph = createMockGraph([]);
        const sourceView = createMockView(sourceShape);
        const targetView = createMockView(targetShape);
        const relationsDictionary: RelationsDictionary = {
            ServiceA: { ServiceB: { lower_limit: 1, upper_limit: 1 } },
            ServiceB: { ServiceA: { lower_limit: 1, upper_limit: 1 } },
        };

        const result = checkIfConnectionIsAllowed(graph, targetView, sourceView, relationsDictionary);

        expect(result).toBe(true);
        expect(sourceShape.validateConnection).toHaveBeenCalledWith(targetShape);
        expect(targetShape.validateConnection).toHaveBeenCalledWith(sourceShape);
    });

    it("should return false when source validation fails", () => {
        const sourceShape = createMockShape("source-1", "ServiceA", false);
        const targetShape = createMockShape("target-1", "ServiceB", true);
        const graph = createMockGraph([]);
        const sourceView = createMockView(sourceShape);
        const targetView = createMockView(targetShape);
        const relationsDictionary: RelationsDictionary = {
            ServiceA: { ServiceB: { lower_limit: 1, upper_limit: 1 } },
            ServiceB: { ServiceA: { lower_limit: 1, upper_limit: 1 } },
        };

        const result = checkIfConnectionIsAllowed(graph, targetView, sourceView, relationsDictionary);

        expect(result).toBe(false);
    });

    it("should return false when target validation fails", () => {
        const sourceShape = createMockShape("source-1", "ServiceA", true);
        const targetShape = createMockShape("target-1", "ServiceB", false);
        const graph = createMockGraph([]);
        const sourceView = createMockView(sourceShape);
        const targetView = createMockView(targetShape);
        const relationsDictionary: RelationsDictionary = {
            ServiceA: { ServiceB: { lower_limit: 1, upper_limit: 1 } },
            ServiceB: { ServiceA: { lower_limit: 1, upper_limit: 1 } },
        };

        const result = checkIfConnectionIsAllowed(graph, targetView, sourceView, relationsDictionary);

        expect(result).toBe(false);
    });

    it("should work with ElementView as well", () => {
        const sourceShape = createMockShape("source-1", "ServiceA", true);
        const targetShape = createMockShape("target-1", "ServiceB", true);
        const graph = createMockGraph([]);
        const sourceView = createMockView(sourceShape) as unknown as dia.ElementView;
        const targetView = createMockView(targetShape) as unknown as dia.ElementView;
        const relationsDictionary: RelationsDictionary = {
            ServiceA: { ServiceB: { lower_limit: 1, upper_limit: 1 } },
            ServiceB: { ServiceA: { lower_limit: 1, upper_limit: 1 } },
        };

        const result = checkIfConnectionIsAllowed(graph, targetView, sourceView, relationsDictionary);

        expect(result).toBe(true);
    });
});
