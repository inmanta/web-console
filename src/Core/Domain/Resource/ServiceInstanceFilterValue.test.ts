import { Resource } from "@/Core";

describe("service instance filter value codec", () => {
  it("keeps the label when it differs from the id", () => {
    expect(Resource.encodeServiceInstanceFilterValue("uuid-1", "cpe-1")).toBe("uuid-1|cpe-1");
  });

  it("omits the label when it is missing or equal to the id", () => {
    expect(Resource.encodeServiceInstanceFilterValue("uuid-1")).toBe("uuid-1");
    expect(Resource.encodeServiceInstanceFilterValue("uuid-1", "uuid-1")).toBe("uuid-1");
  });

  it("parses a compound value into its id and label", () => {
    expect(Resource.parseServiceInstanceFilterValue("uuid-1|cpe-1")).toEqual({
      id: "uuid-1",
      label: "cpe-1",
    });
  });

  it("falls back to the id as the label when no label is stored", () => {
    expect(Resource.parseServiceInstanceFilterValue("uuid-1")).toEqual({
      id: "uuid-1",
      label: "uuid-1",
    });
  });

  it("splits on the first separator so labels may contain it", () => {
    expect(Resource.parseServiceInstanceFilterValue("uuid-1|a|b")).toEqual({
      id: "uuid-1",
      label: "a|b",
    });
  });

  it("round-trips through encode and parse", () => {
    const value = Resource.encodeServiceInstanceFilterValue("uuid-1", "name|with|pipes");

    expect(Resource.parseServiceInstanceFilterValue(value)).toEqual({
      id: "uuid-1",
      label: "name|with|pipes",
    });
  });
});
