import {
    checkEmbeddedEntityConnections,
    checkInterServiceRelationConnections,
    getEmbeddedEntityMissingConnections,
    getInterServiceRelationMissingConnections,
} from "./connectionValidationUtils";
import { ServiceEntityShape } from "../../UI/JointJsShapes/ServiceEntityShape";
import { EmbeddedEntity, InterServiceRelation } from "@/Core";

describe("connectionValidationUtils", () => {
    const createMockShape = (
        isNew: boolean = false,
        connections: Map<string, string[]> = new Map()
    ): ServiceEntityShape => {
        return {
            isNew,
            connections,
        } as unknown as ServiceEntityShape;
    };

    const createEmbeddedEntity = (
        name: string,
        lowerLimit: number = 1,
        modifier: string = "rw"
    ): EmbeddedEntity => ({
        name,
        type: name,
        lower_limit: lowerLimit,
        upper_limit: 1,
        modifier,
        attributes: [],
        embedded_entities: [],
        inter_service_relations: [],
    });

    const createInterServiceRelation = (
        name: string,
        entityType: string,
        lowerLimit: number = 1,
        modifier: string = "rw"
    ): InterServiceRelation => ({
        name,
        entity_type: entityType,
        lower_limit: lowerLimit,
        upper_limit: 1,
        modifier,
    });

    describe("checkEmbeddedEntityConnections", () => {
        it("should return false when connection requirement is satisfied", () => {
            const shape = createMockShape(false, new Map([["EntityType", ["id1"]]]));
            const entity = createEmbeddedEntity("EntityType", 1);

            const result = checkEmbeddedEntityConnections(shape, entity);

            expect(result).toBe(false);
        });

        it("should return true when connection requirement is not satisfied", () => {
            const shape = createMockShape(false, new Map());
            const entity = createEmbeddedEntity("EntityType", 1);

            const result = checkEmbeddedEntityConnections(shape, entity);

            expect(result).toBe(true);
        });

        it("should return false when lower_limit is 0", () => {
            const shape = createMockShape(false, new Map());
            const entity = createEmbeddedEntity("EntityType", 0);

            const result = checkEmbeddedEntityConnections(shape, entity);

            expect(result).toBe(false);
        });

        it("should return false for read-only entities when shape is not new", () => {
            const shape = createMockShape(false, new Map());
            const entity = createEmbeddedEntity("EntityType", 1, "r");

            const result = checkEmbeddedEntityConnections(shape, entity);

            expect(result).toBe(false);
        });

        it("should check connections when shape is new and entity is read-only", () => {
            const shape = createMockShape(true, new Map());
            const entity = createEmbeddedEntity("EntityType", 1, "r");

            const result = checkEmbeddedEntityConnections(shape, entity);

            expect(result).toBe(true);
        });

        it("should handle multiple connections correctly", () => {
            const shape = createMockShape(false, new Map([["EntityType", ["id1", "id2"]]]));
            const entity = createEmbeddedEntity("EntityType", 3);

            const result = checkEmbeddedEntityConnections(shape, entity);

            expect(result).toBe(true); // Only 2 connections, need 3
        });
    });

    describe("checkInterServiceRelationConnections", () => {
        it("should return false when connection requirement is satisfied", () => {
            const shape = createMockShape(false, new Map([["ServiceB", ["id1"]]]));
            const relation = createInterServiceRelation("rel", "ServiceB", 1);

            const result = checkInterServiceRelationConnections(shape, relation);

            expect(result).toBe(false);
        });

        it("should return true when connection requirement is not satisfied", () => {
            const shape = createMockShape(false, new Map());
            const relation = createInterServiceRelation("rel", "ServiceB", 1);

            const result = checkInterServiceRelationConnections(shape, relation);

            expect(result).toBe(true);
        });

        it("should use entity_type as connection key", () => {
            const shape = createMockShape(false, new Map([["ServiceB", ["id1"]]]));
            const relation = createInterServiceRelation("differentName", "ServiceB", 1);

            const result = checkInterServiceRelationConnections(shape, relation);

            expect(result).toBe(false);
        });

        it("should return false when lower_limit is 0", () => {
            const shape = createMockShape(false, new Map());
            const relation = createInterServiceRelation("rel", "ServiceB", 0);

            const result = checkInterServiceRelationConnections(shape, relation);

            expect(result).toBe(false);
        });

        it("should return false for read-only relations when shape is not new", () => {
            const shape = createMockShape(false, new Map());
            const relation = createInterServiceRelation("rel", "ServiceB", 1, "r");

            const result = checkInterServiceRelationConnections(shape, relation);

            expect(result).toBe(false);
        });
    });

    describe("getEmbeddedEntityMissingConnections", () => {
        it("should return null when connection requirement is satisfied", () => {
            const shape = createMockShape(false, new Map([["EntityType", ["id1"]]]));
            const entity = createEmbeddedEntity("EntityType", 1);

            const result = getEmbeddedEntityMissingConnections(shape, entity);

            expect(result).toBeNull();
        });

        it("should return missing connection details when requirement is not satisfied", () => {
            const shape = createMockShape(false, new Map());
            const entity = createEmbeddedEntity("EntityType", 2);

            const result = getEmbeddedEntityMissingConnections(shape, entity);

            expect(result).toEqual({
                name: "EntityType",
                missing: 2,
                required: 2,
            });
        });

        it("should return null when lower_limit is 0", () => {
            const shape = createMockShape(false, new Map());
            const entity = createEmbeddedEntity("EntityType", 0);

            const result = getEmbeddedEntityMissingConnections(shape, entity);

            expect(result).toBeNull();
        });

        it("should return null for read-only entities when shape is not new", () => {
            const shape = createMockShape(false, new Map());
            const entity = createEmbeddedEntity("EntityType", 1, "r");

            const result = getEmbeddedEntityMissingConnections(shape, entity);

            expect(result).toBeNull();
        });

        it("should calculate missing connections correctly", () => {
            const shape = createMockShape(false, new Map([["EntityType", ["id1"]]]));
            const entity = createEmbeddedEntity("EntityType", 3);

            const result = getEmbeddedEntityMissingConnections(shape, entity);

            expect(result).toEqual({
                name: "EntityType",
                missing: 2,
                required: 3,
            });
        });
    });

    describe("getInterServiceRelationMissingConnections", () => {
        it("should return null when connection requirement is satisfied", () => {
            const shape = createMockShape(false, new Map([["ServiceB", ["id1"]]]));
            const relation = createInterServiceRelation("rel", "ServiceB", 1);

            const result = getInterServiceRelationMissingConnections(shape, relation);

            expect(result).toBeNull();
        });

        it("should return missing connection details when requirement is not satisfied", () => {
            const shape = createMockShape(false, new Map());
            const relation = createInterServiceRelation("rel", "ServiceB", 2);

            const result = getInterServiceRelationMissingConnections(shape, relation);

            expect(result).toEqual({
                name: "rel",
                missing: 2,
                required: 2,
            });
        });

        it("should use relation name as display name", () => {
            const shape = createMockShape(false, new Map());
            const relation = createInterServiceRelation("MyRelation", "ServiceB", 1);

            const result = getInterServiceRelationMissingConnections(shape, relation);

            expect(result).toEqual({
                name: "MyRelation",
                missing: 1,
                required: 1,
            });
        });

        it("should return null when lower_limit is 0", () => {
            const shape = createMockShape(false, new Map());
            const relation = createInterServiceRelation("rel", "ServiceB", 0);

            const result = getInterServiceRelationMissingConnections(shape, relation);

            expect(result).toBeNull();
        });

        it("should return null for read-only relations when shape is not new", () => {
            const shape = createMockShape(false, new Map());
            const relation = createInterServiceRelation("rel", "ServiceB", 1, "r");

            const result = getInterServiceRelationMissingConnections(shape, relation);

            expect(result).toBeNull();
        });
    });
});
