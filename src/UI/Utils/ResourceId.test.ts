import { getResourceIdFromResourceVersionId } from "./ResourceId";

describe("getResourceIdFromResourceVersionId", () => {
  it("should remove version suffix from resource version ID", () => {
    const resourceVersionId = "resource::test[name],v=123";
    const result = getResourceIdFromResourceVersionId(resourceVersionId);
    expect(result).toBe("resource::test[name]");
  });

  it("should handle complex resource IDs with commas", () => {
    const resourceVersionId =
      "resource::namespace::type[name,with,commas],v=456";
    const result = getResourceIdFromResourceVersionId(resourceVersionId);
    expect(result).toBe("resource::namespace::type[name,with,commas]");
  });

  it('should handle resource IDs with "v=" in the name', () => {
    const resourceVersionId = "hello[world,v=42],v=123";
    const result = getResourceIdFromResourceVersionId(resourceVersionId);
    expect(result).toBe("hello[world,v=42]");
  });

  it("should return the original string if no version suffix is present", () => {
    const resourceId = "resource::test[name]";
    const result = getResourceIdFromResourceVersionId(resourceId);
    expect(result).toBe(resourceId);
  });

  it("should handle empty strings", () => {
    const result = getResourceIdFromResourceVersionId("");
    expect(result).toBe("");
  });

  it("should handle long UUIDs in resource names", () => {
    const resourceVersionId =
      "unittest::Resource[internal,name=0a5ec450-5f3e-4dab-81cd-60c158ffb66f],v=2";
    const result = getResourceIdFromResourceVersionId(resourceVersionId);
    expect(result).toBe(
      "unittest::Resource[internal,name=0a5ec450-5f3e-4dab-81cd-60c158ffb66f]",
    );
  });
});
