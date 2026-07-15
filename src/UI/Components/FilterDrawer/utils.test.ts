import { countActiveFilters } from "./utils";

describe("countActiveFilters", () => {
  it("returns 0 for an empty filter", () => {
    expect(countActiveFilters({})).toEqual(0);
  });

  it("returns 0 when all filter values are undefined", () => {
    expect(countActiveFilters({ type: undefined, agent: undefined })).toEqual(0);
  });

  it("counts each element of an array filter value", () => {
    expect(countActiveFilters({ type: ["web::Server", "web::Client"] })).toEqual(2);
  });

  it("counts a non-array truthy value as 1", () => {
    expect(countActiveFilters({ name: "my-resource" })).toEqual(1);
  });

  it("counts across multiple fields", () => {
    expect(
      countActiveFilters({ type: ["web::Server"], agent: ["internal"], value: ["myvalue"] })
    ).toEqual(3);
  });

  it("ignores undefined fields and counts the rest", () => {
    expect(countActiveFilters({ type: ["web::Server", "web::Client"], agent: undefined })).toEqual(
      2
    );
  });

  it("preserves extra fields on a filter superset", () => {
    expect(
      countActiveFilters({
        type: ["web::Server"],
        agent: ["internal"],
        name: undefined,
        discovered_resource_id: undefined,
      })
    ).toEqual(2);
  });
});
