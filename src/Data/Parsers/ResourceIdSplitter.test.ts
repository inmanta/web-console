import { splitResourceId } from "./ResourceIdSplitter";

describe("splitResourceId", () => {
    describe("valid resource IDs", () => {
        it("should parse a simple resource ID correctly", () => {
            const resourceId = "resource::type[agent,key=value]";
            const result = splitResourceId(resourceId);

            expect(result).toEqual({
                type: "resource::type",
                agent: "agent",
                value: "value"
            });
        });

        it("should parse resource ID with complex type containing multiple colons", () => {
            const resourceId = "namespace::subnamespace::type[agent,key=value]";
            const result = splitResourceId(resourceId);

            expect(result).toEqual({
                type: "namespace::subnamespace::type",
                agent: "agent",
                value: "value"
            });
        });

        it("should parse resource ID with hyphens in type", () => {
            const resourceId = "my-resource::my-type[agent,key=value]";
            const result = splitResourceId(resourceId);

            expect(result).toEqual({
                type: "my-resource::my-type",
                agent: "agent",
                value: "value"
            });
        });

        it("should parse resource ID with underscores in type", () => {
            const resourceId = "my_resource::my_type[agent,key=value]";
            const result = splitResourceId(resourceId);

            expect(result).toEqual({
                type: "my_resource::my_type",
                agent: "agent",
                value: "value"
            });
        });

        it("should parse resource ID with complex agent name", () => {
            const resourceId = "resource::type[agent-with-dashes,key=value]";
            const result = splitResourceId(resourceId);

            expect(result).toEqual({
                type: "resource::type",
                agent: "agent-with-dashes",
                value: "value"
            });
        });

        it("should parse resource ID with complex value containing special characters", () => {
            const resourceId = "resource::type[agent,key=value-with-special-chars_123]";
            const result = splitResourceId(resourceId);

            expect(result).toEqual({
                type: "resource::type",
                agent: "agent",
                value: "value-with-special-chars_123"
            });
        });

        it("should throw error for resource ID with empty value", () => {
            const resourceId = "resource::type[agent,key=]";

            expect(() => splitResourceId(resourceId)).toThrow("Invalid resource id: resource::type[agent,key=]");
        });

        it("should parse resource ID with numeric value", () => {
            const resourceId = "resource::type[agent,port=8080]";
            const result = splitResourceId(resourceId);

            expect(result).toEqual({
                type: "resource::type",
                agent: "agent",
                value: "8080"
            });
        });

        it("should parse resource ID with UUID as value", () => {
            const resourceId = "resource::type[agent,id=550e8400-e29b-41d4-a716-446655440000]";
            const result = splitResourceId(resourceId);

            expect(result).toEqual({
                type: "resource::type",
                agent: "agent",
                value: "550e8400-e29b-41d4-a716-446655440000"
            });
        });

        it("should parse resource ID with complex key-value pair", () => {
            const resourceId = "resource::type[agent,complex_key=complex_value_with_underscores]";
            const result = splitResourceId(resourceId);

            expect(result).toEqual({
                type: "resource::type",
                agent: "agent",
                value: "complex_value_with_underscores"
            });
        });
    });

    describe("invalid resource IDs", () => {
        it("should throw error for resource ID without brackets", () => {
            const resourceId = "resource::type";

            expect(() => splitResourceId(resourceId)).toThrow("Invalid resource id: resource::type");
        });

        it("should parse resource ID with incomplete brackets (missing closing bracket)", () => {
            const resourceId = "resource::type[agent,key=value";
            const result = splitResourceId(resourceId);

            expect(result).toEqual({
                type: "resource::type",
                agent: "agent",
                value: "value"
            });
        });

        it("should throw error for resource ID without type", () => {
            const resourceId = "[agent,key=value]";

            expect(() => splitResourceId(resourceId)).toThrow("Invalid resource id: [agent,key=value]");
        });

        it("should throw error for resource ID without agent", () => {
            const resourceId = "resource::type[,key=value]";

            expect(() => splitResourceId(resourceId)).toThrow("Invalid resource id: resource::type[,key=value]");
        });

        it("should throw error for resource ID without key-value pair", () => {
            const resourceId = "resource::type[agent]";

            expect(() => splitResourceId(resourceId)).toThrow("Invalid resource id: resource::type[agent]");
        });

        it("should throw error for resource ID with malformed key-value pair", () => {
            const resourceId = "resource::type[agent,keyvalue]";

            expect(() => splitResourceId(resourceId)).toThrow("Invalid resource id: resource::type[agent,keyvalue]");
        });

        it("should throw error for empty string", () => {
            const resourceId = "";

            expect(() => splitResourceId(resourceId)).toThrow("Invalid resource id: ");
        });

        it("should throw error for resource ID with spaces", () => {
            const resourceId = "resource::type [agent, key=value]";

            expect(() => splitResourceId(resourceId)).toThrow("Invalid resource id: resource::type [agent, key=value]");
        });

        it("should throw error for resource ID with special characters in type", () => {
            const resourceId = "resource@type[agent,key=value]";

            expect(() => splitResourceId(resourceId)).toThrow("Invalid resource id: resource@type[agent,key=value]");
        });

        it("should parse resource ID with multiple key-value pairs (only first one is captured)", () => {
            const resourceId = "resource::type[agent,key1=value1,key2=value2]";
            const result = splitResourceId(resourceId);

            expect(result).toEqual({
                type: "resource::type",
                agent: "agent",
                value: "value1,key2=value2"
            });
        });
    });

    describe("edge cases", () => {
        it("should handle resource ID with minimum valid components", () => {
            const resourceId = "a::b[c,d=e]";
            const result = splitResourceId(resourceId);

            expect(result).toEqual({
                type: "a::b",
                agent: "c",
                value: "e"
            });
        });

        it("should handle resource ID with very long type", () => {
            const longType = "a".repeat(100) + "::" + "b".repeat(100);
            const resourceId = `${longType}[agent,key=value]`;
            const result = splitResourceId(resourceId);

            expect(result).toEqual({
                type: longType,
                agent: "agent",
                value: "value"
            });
        });

        it("should handle resource ID with very long agent name", () => {
            const longAgent = "agent".repeat(50);
            const resourceId = `resource::type[${longAgent},key=value]`;
            const result = splitResourceId(resourceId);

            expect(result).toEqual({
                type: "resource::type",
                agent: longAgent,
                value: "value"
            });
        });

        it("should handle resource ID with very long value", () => {
            const longValue = "value".repeat(100);
            const resourceId = `resource::type[agent,key=${longValue}]`;
            const result = splitResourceId(resourceId);

            expect(result).toEqual({
                type: "resource::type",
                agent: "agent",
                value: longValue
            });
        });

        it("should handle resource ID with special characters in value", () => {
            const resourceId = "resource::type[agent,key=value.with.dots]";
            const result = splitResourceId(resourceId);

            expect(result).toEqual({
                type: "resource::type",
                agent: "agent",
                value: "value.with.dots"
            });
        });

        it("should handle resource ID with forward slashes in value", () => {
            const resourceId = "resource::type[agent,path=/path/to/resource]";
            const result = splitResourceId(resourceId);

            expect(result).toEqual({
                type: "resource::type",
                agent: "agent",
                value: "/path/to/resource"
            });
        });
    });
});
