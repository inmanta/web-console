import { createPlaceholderInstance } from "./createPlaceholderInstance";
import { ServiceModel } from "@/Core";

describe("createPlaceholderInstance", () => {
    const createMockServiceModel = (name: string, attributes: Array<{ name: string }> = []): ServiceModel => ({
        name,
        environment: "test",
        lifecycle: {
            initial_state: "active",
            states: [],
            transfers: [],
        },
        attributes,
        config: {},
        embedded_entities: [],
        inter_service_relations: [],
        owned_entities: [],
        owner: null,
    });

    it("should create a placeholder instance with generated UUID", () => {
        const serviceModel = createMockServiceModel("TestService", [
            { name: "name" },
            { name: "description" },
        ]);

        const result = createPlaceholderInstance(serviceModel);

        expect(result.instance.id).toBeDefined();
        expect(result.instance.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
        expect(result.instance.service_entity).toBe("TestService");
        expect(result.instance.version).toBe(0);
        expect(result.instance.environment).toBe("");
        expect(result.instance.state).toBe("creating");
        expect(result.instance.deleted).toBe(false);
        expect(result.interServiceRelations).toEqual([]);
    });

    it("should use provided instanceId when given", () => {
        const serviceModel = createMockServiceModel("TestService");
        const customId = "custom-instance-id";

        const result = createPlaceholderInstance(serviceModel, customId);

        expect(result.instance.id).toBe(customId);
    });

    it("should initialize all attributes with null", () => {
        const serviceModel = createMockServiceModel("TestService", [
            { name: "name" },
            { name: "description" },
            { name: "port" },
        ]);

        const result = createPlaceholderInstance(serviceModel);

        expect(result.instance.candidate_attributes).toEqual({
            name: null,
            description: null,
            port: null,
        });
    });

    it("should set active_attributes to null", () => {
        const serviceModel = createMockServiceModel("TestService");

        const result = createPlaceholderInstance(serviceModel);

        expect(result.instance.active_attributes).toBeNull();
    });

    it("should set rollback_attributes to null", () => {
        const serviceModel = createMockServiceModel("TestService");

        const result = createPlaceholderInstance(serviceModel);

        expect(result.instance.rollback_attributes).toBeNull();
    });

    it("should set callback to empty array", () => {
        const serviceModel = createMockServiceModel("TestService");

        const result = createPlaceholderInstance(serviceModel);

        expect(result.instance.callback).toEqual([]);
    });

    it("should set referenced_by to null", () => {
        const serviceModel = createMockServiceModel("TestService");

        const result = createPlaceholderInstance(serviceModel);

        expect(result.instance.referenced_by).toBeNull();
    });

    it("should set timestamps", () => {
        const serviceModel = createMockServiceModel("TestService");
        const before = new Date().toISOString();

        const result = createPlaceholderInstance(serviceModel);

        const after = new Date().toISOString();

        expect(result.instance.created_at).toBeDefined();
        expect(result.instance.last_updated).toBeDefined();
        expect(result.instance.created_at >= before).toBe(true);
        expect(result.instance.created_at <= after).toBe(true);
        expect(result.instance.last_updated >= before).toBe(true);
        expect(result.instance.last_updated <= after).toBe(true);
    });

    it("should handle service model with no attributes", () => {
        const serviceModel = createMockServiceModel("TestService", []);

        const result = createPlaceholderInstance(serviceModel);

        expect(result.instance.candidate_attributes).toEqual({});
    });
});
