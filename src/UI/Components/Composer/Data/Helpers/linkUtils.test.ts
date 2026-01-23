import { createLinkShape, addConnectionsBetweenShapes, removeConnectionsBetweenShapes } from "./linkUtils";
import { ServiceEntityShape } from "../../UI/JointJsShapes/ServiceEntityShape";
import { LinkShape } from "../../UI/JointJsShapes/LinkShape";
import { dia } from "@inmanta/rappid";
import { defineObjectsForJointJS } from "../../testSetup";

// Mock LinkShape
vi.mock("../../UI/JointJsShapes/LinkShape", () => ({
    LinkShape: vi.fn().mockImplementation(() => ({
        source: vi.fn().mockReturnThis(),
        target: vi.fn().mockReturnThis(),
        router: vi.fn().mockReturnThis(),
        connector: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
    })),
}));

describe("linkUtils", () => {
    beforeAll(() => {
        defineObjectsForJointJS();
    });

    const createMockShape = (id: string, entityName: string): ServiceEntityShape => {
        return {
            id,
            getEntityName: vi.fn().mockReturnValue(entityName),
            addConnection: vi.fn(),
            removeConnection: vi.fn(),
        } as unknown as ServiceEntityShape;
    };

    const createMockPaper = (): dia.Paper => {
        return {
            options: {
                defaultRouter: "manhattan",
                defaultConnector: "rounded",
                defaultAnchor: "center",
            },
        } as unknown as dia.Paper;
    };

    describe("createLinkShape", () => {
        it("should create a link with source and target", () => {
            const sourceShape = createMockShape("source-1", "ServiceA");
            const targetShape = createMockShape("target-1", "ServiceB");

            const link = createLinkShape(sourceShape, targetShape);

            expect(LinkShape).toHaveBeenCalled();
            expect(link.source).toHaveBeenCalledWith({ id: "source-1", port: "ServiceB" });
            expect(link.target).toHaveBeenCalledWith({ id: "target-1" });
        });

        it("should use target entity name as port", () => {
            const sourceShape = createMockShape("source-1", "ServiceA");
            const targetShape = createMockShape("target-1", "ServiceB");

            createLinkShape(sourceShape, targetShape);

            expect(targetShape.getEntityName).toHaveBeenCalled();
        });

        it("should apply paper options when provided", () => {
            const sourceShape = createMockShape("source-1", "ServiceA");
            const targetShape = createMockShape("target-1", "ServiceB");
            const paper = createMockPaper();

            const link = createLinkShape(sourceShape, targetShape, paper);

            expect(link.router).toHaveBeenCalledWith("manhattan");
            expect(link.connector).toHaveBeenCalledWith("rounded");
            expect(link.set).toHaveBeenCalledWith("defaultAnchor", "center");
        });

        it("should work without paper options", () => {
            const sourceShape = createMockShape("source-1", "ServiceA");
            const targetShape = createMockShape("target-1", "ServiceB");

            const link = createLinkShape(sourceShape, targetShape);

            expect(link).toBeDefined();
        });

        it("should handle missing paper options gracefully", () => {
            const sourceShape = createMockShape("source-1", "ServiceA");
            const targetShape = createMockShape("target-1", "ServiceB");
            const paper = {
                options: {},
            } as unknown as dia.Paper;

            const link = createLinkShape(sourceShape, targetShape, paper);

            expect(link).toBeDefined();
        });
    });

    describe("addConnectionsBetweenShapes", () => {
        it("should add connections to both shapes", () => {
            const sourceShape = createMockShape("source-1", "ServiceA");
            const targetShape = createMockShape("target-1", "ServiceB");

            addConnectionsBetweenShapes(sourceShape, targetShape);

            expect(sourceShape.addConnection).toHaveBeenCalledWith("target-1", "ServiceB");
            expect(targetShape.addConnection).toHaveBeenCalledWith("source-1", "ServiceA");
        });

        it("should use correct relation keys", () => {
            const sourceShape = createMockShape("source-1", "ServiceA");
            const targetShape = createMockShape("target-1", "ServiceB");

            addConnectionsBetweenShapes(sourceShape, targetShape);

            // Source connects to target using target's entity name
            expect(sourceShape.addConnection).toHaveBeenCalledWith("target-1", "ServiceB");
            // Target connects to source using source's entity name
            expect(targetShape.addConnection).toHaveBeenCalledWith("source-1", "ServiceA");
        });
    });

    describe("removeConnectionsBetweenShapes", () => {
        it("should remove connections from both shapes", () => {
            const sourceShape = createMockShape("source-1", "ServiceA");
            const targetShape = createMockShape("target-1", "ServiceB");

            removeConnectionsBetweenShapes(sourceShape, targetShape);

            expect(sourceShape.removeConnection).toHaveBeenCalledWith("target-1", "ServiceB");
            expect(targetShape.removeConnection).toHaveBeenCalledWith("source-1", "ServiceA");
        });

        it("should use correct relation keys", () => {
            const sourceShape = createMockShape("source-1", "ServiceA");
            const targetShape = createMockShape("target-1", "ServiceB");

            removeConnectionsBetweenShapes(sourceShape, targetShape);

            // Source removes connection to target using target's entity name
            expect(sourceShape.removeConnection).toHaveBeenCalledWith("target-1", "ServiceB");
            // Target removes connection to source using source's entity name
            expect(targetShape.removeConnection).toHaveBeenCalledWith("source-1", "ServiceA");
        });
    });
});
