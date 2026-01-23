import {
    findInterServiceRelations,
    findFullInterServiceRelations,
    findParentShapeForEmbedded,
    getRelationInfo,
    canRemoveShape,
    canRemoveLink,
} from "./relationsHelpers";
import { ServiceEntityShape } from "../../UI/JointJsShapes/ServiceEntityShape";
import { ServiceModel, EmbeddedEntity, InterServiceRelation } from "@/Core";
import { RelationsDictionary, Rules } from "./createRelationsDictionary";
import { dia } from "@inmanta/rappid";
import { defineObjectsForJointJS } from "../../testSetup";

describe("relationsHelpers", () => {
    beforeAll(() => {
        defineObjectsForJointJS();
    });

    const createMockServiceModel = (name: string, overrides: Partial<ServiceModel> = {}): ServiceModel => ({
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
        ...overrides,
    });

    const createMockEmbeddedEntity = (name: string, type: string, overrides: Partial<EmbeddedEntity> = {}): EmbeddedEntity => ({
        name,
        type,
        lower_limit: 1,
        upper_limit: 1,
        modifier: "rw",
        attributes: [],
        embedded_entities: [],
        inter_service_relations: [],
        ...overrides,
    });

    const createMockInterServiceRelation = (
        name: string,
        entityType: string,
        modifier: string = "rw"
    ): InterServiceRelation => ({
        name,
        entity_type: entityType,
        lower_limit: 1,
        upper_limit: 1,
        modifier,
    });

    const createMockShape = (
        id: string,
        entityName: string,
        entityType: "core" | "embedded" | "relation" = "core",
        isNew: boolean = false,
        connections: Map<string, string[]> = new Map(),
        serviceModel: ServiceModel | EmbeddedEntity
    ): ServiceEntityShape => {
        const shape = {
            id,
            entityType,
            isNew,
            connections,
            serviceModel,
            getEntityName: vi.fn().mockReturnValue(entityName),
        } as unknown as ServiceEntityShape;
        // Make it pass instanceof checks
        Object.setPrototypeOf(shape, ServiceEntityShape.prototype);
        return shape;
    };

    describe("findInterServiceRelations", () => {
        it("should return entity types from inter_service_relations", () => {
            const serviceModel = createMockServiceModel("ServiceA", {
                inter_service_relations: [
                    createMockInterServiceRelation("rel1", "ServiceB"),
                    createMockInterServiceRelation("rel2", "ServiceC"),
                ],
            });

            const result = findInterServiceRelations(serviceModel);

            expect(result).toEqual(["ServiceB", "ServiceC"]);
        });

        it("should recursively find relations from embedded entities", () => {
            const serviceModel = createMockServiceModel("ServiceA", {
                embedded_entities: [
                    createMockEmbeddedEntity("Embedded1", "EmbeddedType", {
                        inter_service_relations: [createMockInterServiceRelation("rel1", "ServiceB")],
                    }),
                ],
            });

            const result = findInterServiceRelations(serviceModel);

            expect(result).toEqual(["ServiceB"]);
        });

        it("should return empty array when no relations exist", () => {
            const serviceModel = createMockServiceModel("ServiceA");

            const result = findInterServiceRelations(serviceModel);

            expect(result).toEqual([]);
        });
    });

    describe("findFullInterServiceRelations", () => {
        it("should return full inter-service relation objects", () => {
            const relation1 = createMockInterServiceRelation("rel1", "ServiceB");
            const relation2 = createMockInterServiceRelation("rel2", "ServiceC");
            const serviceModel = createMockServiceModel("ServiceA", {
                inter_service_relations: [relation1, relation2],
            });

            const result = findFullInterServiceRelations(serviceModel);

            expect(result).toEqual([relation1, relation2]);
        });

        it("should recursively find relations from embedded entities", () => {
            const relation = createMockInterServiceRelation("rel1", "ServiceB");
            const serviceModel = createMockServiceModel("ServiceA", {
                embedded_entities: [
                    createMockEmbeddedEntity("Embedded1", "EmbeddedType", {
                        inter_service_relations: [relation],
                    }),
                ],
            });

            const result = findFullInterServiceRelations(serviceModel);

            expect(result).toEqual([relation]);
        });
    });

    describe("findParentShapeForEmbedded", () => {
        it("should find parent shape from incoming links", () => {
            const parentShape = createMockShape("parent-1", "ServiceA", "core", false, new Map(), createMockServiceModel("ServiceA"));
            const embeddedShape = createMockShape("embedded-1", "EmbeddedType", "embedded", false, new Map(), createMockEmbeddedEntity("Embedded1", "EmbeddedType"));

            const link = {
                getSourceElement: vi.fn().mockReturnValue(parentShape),
                getTargetElement: vi.fn().mockReturnValue(embeddedShape),
            } as unknown as dia.Link;

            const graph = {
                getLinks: vi.fn().mockReturnValue([link]),
            } as unknown as dia.Graph;

            const result = findParentShapeForEmbedded(embeddedShape, graph);

            expect(result).toBe(parentShape);
        });

        it("should return null when no parent is found", () => {
            const embeddedShape = createMockShape("embedded-1", "EmbeddedType", "embedded", false, new Map(), createMockEmbeddedEntity("Embedded1", "EmbeddedType"));

            const graph = {
                getLinks: vi.fn().mockReturnValue([]),
            } as unknown as dia.Graph;

            const result = findParentShapeForEmbedded(embeddedShape, graph);

            expect(result).toBeNull();
        });
    });

    describe("getRelationInfo", () => {
        it("should return relation info when found in dictionary", () => {
            const serviceModelA = createMockServiceModel("ServiceA", {
                inter_service_relations: [createMockInterServiceRelation("rel1", "ServiceB", "rw")],
            });
            const sourceShape = createMockShape("source-1", "ServiceA", "core", false, new Map(), serviceModelA);
            const targetShape = createMockShape("target-1", "ServiceB", "core", false, new Map(), createMockServiceModel("ServiceB"));

            const relationsDictionary: RelationsDictionary = {
                ServiceA: {
                    ServiceB: { lower_limit: 1, upper_limit: 1 },
                },
            };

            const serviceCatalog: ServiceModel[] = [serviceModelA, createMockServiceModel("ServiceB")];

            const graph = {
                getLinks: vi.fn().mockReturnValue([]),
            } as unknown as dia.Graph;

            const result = getRelationInfo(sourceShape, targetShape, relationsDictionary, graph, serviceCatalog);

            expect(result).toEqual({
                rules: { lower_limit: 1, upper_limit: 1 },
                modifier: "rw",
            });
        });

        it("should return null when relation not found", () => {
            const sourceShape = createMockShape("source-1", "ServiceA", "core", false, new Map(), createMockServiceModel("ServiceA"));
            const targetShape = createMockShape("target-1", "ServiceB", "core", false, new Map(), createMockServiceModel("ServiceB"));

            const relationsDictionary: RelationsDictionary = {};

            const graph = {
                getLinks: vi.fn().mockReturnValue([]),
            } as unknown as dia.Graph;

            const result = getRelationInfo(sourceShape, targetShape, relationsDictionary, graph, []);

            expect(result).toBeNull();
        });
    });

    describe("canRemoveShape", () => {
        it("should return true for new shapes", () => {
            const shape = createMockShape("shape-1", "ServiceA", "core", true, new Map(), createMockServiceModel("ServiceA"));
            const graph = {
                getLinks: vi.fn().mockReturnValue([]),
            } as unknown as dia.Graph;

            const result = canRemoveShape(shape, graph, {}, []);

            expect(result).toBe(true);
        });

        it("should return false when removing would violate lower_limit", () => {
            const serviceModelB = createMockServiceModel("ServiceB", {
                inter_service_relations: [createMockInterServiceRelation("rel1", "ServiceA", "rw")],
            });
            const sourceShape = createMockShape("source-1", "ServiceA", "core", false, new Map([["ServiceB", ["target-1"]]]), createMockServiceModel("ServiceA"));
            const targetShape = createMockShape("target-1", "ServiceB", "core", false, new Map([["ServiceA", ["source-1"]]]), serviceModelB);

            const link = {
                getSourceElement: vi.fn().mockReturnValue(sourceShape),
                getTargetElement: vi.fn().mockReturnValue(targetShape),
            } as unknown as dia.Link;

            const graph = {
                getLinks: vi.fn().mockReturnValue([link]),
            } as unknown as dia.Graph;

            const relationsDictionary: RelationsDictionary = {
                ServiceB: {
                    ServiceA: { lower_limit: 1, upper_limit: 1 },
                },
            };

            const serviceCatalog: ServiceModel[] = [
                createMockServiceModel("ServiceA"),
                serviceModelB,
            ];

            const result = canRemoveShape(sourceShape, graph, relationsDictionary, serviceCatalog);

            expect(result).toBe(false);
        });

        it("should return false when shape has rw modifier and is not new", () => {
            const serviceModelA = createMockServiceModel("ServiceA", {
                inter_service_relations: [createMockInterServiceRelation("rel1", "ServiceB", "rw")],
            });
            const shape = createMockShape("shape-1", "ServiceA", "core", false, new Map([["ServiceB", ["target-1"]]]), serviceModelA);

            const graph = {
                getLinks: vi.fn().mockReturnValue([]),
            } as unknown as dia.Graph;

            const relationsDictionary: RelationsDictionary = {
                ServiceA: {
                    ServiceB: { lower_limit: 1, upper_limit: 1 },
                },
            };

            const serviceCatalog: ServiceModel[] = [serviceModelA];

            const result = canRemoveShape(shape, graph, relationsDictionary, serviceCatalog);

            expect(result).toBe(false);
        });
    });

    describe("canRemoveLink", () => {
        it("should return true when link can be removed", () => {
            // Make source shape new so rw modifier doesn't block removal
            const serviceModelA = createMockServiceModel("ServiceA", {
                inter_service_relations: [createMockInterServiceRelation("rel1", "ServiceB", "rw")],
            });
            const sourceShape = createMockShape("source-1", "ServiceA", "core", true, new Map([["ServiceB", ["target-1", "target-2"]]]), serviceModelA);
            const targetShape = createMockShape("target-1", "ServiceB", "core", false, new Map([["ServiceA", ["source-1"]]]), createMockServiceModel("ServiceB"));

            const graph = {
                getLinks: vi.fn().mockReturnValue([]),
            } as unknown as dia.Graph;

            const relationsDictionary: RelationsDictionary = {
                ServiceA: {
                    ServiceB: { lower_limit: 1, upper_limit: 1 },
                },
                ServiceB: {
                    ServiceA: { lower_limit: 0, upper_limit: 1 },
                },
            };

            const serviceCatalog: ServiceModel[] = [
                serviceModelA,
                createMockServiceModel("ServiceB"),
            ];

            const result = canRemoveLink(sourceShape, targetShape, graph, relationsDictionary, serviceCatalog);

            expect(result).toBe(true);
        });

        it("should return false when removing would violate lower_limit", () => {
            const serviceModelA = createMockServiceModel("ServiceA", {
                inter_service_relations: [createMockInterServiceRelation("rel1", "ServiceB", "rw")],
            });
            const serviceModelB = createMockServiceModel("ServiceB", {
                inter_service_relations: [createMockInterServiceRelation("rel1", "ServiceA", "rw")],
            });
            const sourceShape = createMockShape("source-1", "ServiceA", "core", false, new Map([["ServiceB", ["target-1"]]]), serviceModelA);
            const targetShape = createMockShape("target-1", "ServiceB", "core", false, new Map([["ServiceA", ["source-1"]]]), serviceModelB);

            const graph = {
                getLinks: vi.fn().mockReturnValue([]),
            } as unknown as dia.Graph;

            const relationsDictionary: RelationsDictionary = {
                ServiceA: {
                    ServiceB: { lower_limit: 1, upper_limit: 1 },
                },
                ServiceB: {
                    ServiceA: { lower_limit: 1, upper_limit: 1 },
                },
            };

            const serviceCatalog: ServiceModel[] = [
                serviceModelA,
                serviceModelB,
            ];

            const result = canRemoveLink(sourceShape, targetShape, graph, relationsDictionary, serviceCatalog);

            expect(result).toBe(false);
        });
    });
});
