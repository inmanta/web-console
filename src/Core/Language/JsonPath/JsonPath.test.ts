import * as Maybe from "@/Core/Language/Maybe";
import { evaluate, isSupportedPath, rootMember } from "./JsonPath";

const data = {
  id: "instance-1",
  candidate_attributes: {
    network_name: "nw-a",
    vlan: 0,
    enabled: false,
    owner: null,
  },
  endpoints: [
    { name: "ep1", region: "eu" },
    { name: "ep2", region: "us" },
  ],
  duplicates: [
    { name: "dup", region: "eu" },
    { name: "dup", region: "us" },
  ],
};

const expectSome = (result: Maybe.Type<unknown>): unknown => {
  expect(Maybe.isSome(result)).toBe(true);

  // narrow for the caller; guarded by the assertion above
  return (result as { value: unknown }).value;
};

describe("JsonPath.evaluate", () => {
  it("reads a nested member path", () => {
    expect(expectSome(evaluate(data, "candidate_attributes.network_name"))).toBe("nw-a");
  });

  it("reads an array element by index", () => {
    expect(expectSome(evaluate(data, "endpoints[0].region"))).toBe("eu");
  });

  it("selects an array element by an equality filter (RFC 9535, no parentheses)", () => {
    expect(expectSome(evaluate(data, "endpoints[?@.name=='ep2'].region"))).toBe("us");
  });

  it("accepts an explicit leading root identifier", () => {
    expect(expectSome(evaluate(data, "$.candidate_attributes.network_name"))).toBe("nw-a");
  });

  it("preserves falsy scalars including a genuine null", () => {
    expect(expectSome(evaluate(data, "candidate_attributes.vlan"))).toBe(0);
    expect(expectSome(evaluate(data, "candidate_attributes.enabled"))).toBe(false);
    expect(expectSome(evaluate(data, "candidate_attributes.owner"))).toBe(null);
  });

  it("returns none when the path matches nothing", () => {
    expect(Maybe.isNone(evaluate(data, "candidate_attributes.missing"))).toBe(true);
  });

  it("returns none when a filter matches more than one element (ambiguous)", () => {
    expect(Maybe.isNone(evaluate(data, "duplicates[?@.name=='dup'].region"))).toBe(true);
  });

  it("returns none for unsupported constructs rather than dumping multiple values", () => {
    expect(Maybe.isNone(evaluate(data, "endpoints[*].region"))).toBe(true);
    expect(Maybe.isNone(evaluate(data, "$..region"))).toBe(true);
  });

  it("returns none for a syntactically invalid path", () => {
    expect(Maybe.isNone(evaluate(data, "endpoints[invalid"))).toBe(true);
  });
});

describe("JsonPath.isSupportedPath", () => {
  it.each([
    "candidate_attributes.network_name",
    "$.candidate_attributes.network_name",
    "endpoints[0].region",
    "endpoints['0'].region",
    "endpoints[?@.name=='ep1'].region",
    "id",
  ])("accepts navigational path %s", (path) => {
    expect(isSupportedPath(path)).toBe(true);
  });

  it.each([
    "endpoints[*]", // wildcard
    "$..region", // recursive descent
    "endpoints[0:1]", // slice
    "endpoints['name','region']", // union
    "endpoints[?@.region!='eu']", // non-equality comparison
    "endpoints[?@.vlan>1]", // non-equality comparison
    "endpoints[?@.name=='ep1' && @.region=='eu']", // logical composition
    "endpoints[invalid", // syntax error
  ])("rejects non-navigational path %s", (path) => {
    expect(isSupportedPath(path)).toBe(false);
  });
});

describe("rootMember", () => {
  it.each([
    ["id", "id"],
    ["candidate_attributes.network_name", "candidate_attributes"],
    ["$.id", "id"],
    ["$.candidate_attributes.network_name", "candidate_attributes"],
    ["endpoints[?@.name=='ep1'].region", "endpoints"],
    ["  site  ", "site"],
  ])("reads the root member of %s as %s", (path, expected) => {
    expect(rootMember(path)).toBe(expected);
  });

  it.each([
    ["[0].region", "a leading array index"],
    ["", "an empty path"],
  ])("returns null for %s (%s)", (path) => {
    expect(rootMember(path)).toBeNull();
  });
});
