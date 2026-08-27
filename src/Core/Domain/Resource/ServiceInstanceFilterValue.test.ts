import { Resource } from "@/Core";

describe("service instance filter value codec", () => {
  it("round-trips the id and label", () => {
    const value = Resource.encodeServiceInstanceFilterValue("uuid-1", "cpe-1");

    expect(Resource.parseServiceInstanceFilterValue(value)).toEqual({
      id: "uuid-1",
      label: "cpe-1",
    });
  });

  it("falls back to the id as the label when no label is provided", () => {
    const value = Resource.encodeServiceInstanceFilterValue("uuid-1");

    expect(Resource.parseServiceInstanceFilterValue(value)).toEqual({
      id: "uuid-1",
      label: "uuid-1",
    });
  });

  it("round-trips labels containing characters that would break a separator scheme", () => {
    const label = 'name|with"pipes"and{braces}';
    const value = Resource.encodeServiceInstanceFilterValue("uuid-1", label);

    expect(Resource.parseServiceInstanceFilterValue(value)).toEqual({
      id: "uuid-1",
      label,
    });
  });
});
