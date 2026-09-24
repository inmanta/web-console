import { Reference } from "@/Core/Domain";
import { complianceReferences } from "./Mock";
import { indexReferences, normalizeArgument, normalizeReference } from "./indexReferences";

describe("normalizeArgument", () => {
  test.each<{ raw: Reference.RawArgument; expected: Reference.Argument }>([
    {
      raw: { name: "n", type: "literal", value: "v" },
      expected: { kind: "literal", name: "n", value: "v" },
    },
    {
      raw: { name: "n", type: "json", value: { a: 1 } },
      expected: { kind: "json", name: "n", value: { a: 1 } },
    },
    {
      raw: { name: "n", type: "reference", id: "ref-1" },
      expected: { kind: "reference", name: "n", referenceId: "ref-1" },
    },
    {
      raw: { name: "n", type: "resource", id: "res-1" },
      expected: { kind: "resource", name: "n", resourceId: "res-1" },
    },
    {
      raw: { name: "n", type: "python_type", value: "str" },
      expected: { kind: "python_type", name: "n", value: "str" },
    },
    {
      raw: { name: "n", type: "get", dict_path_expression: "a.b" },
      expected: { kind: "get", name: "n", expression: "a.b" },
    },
  ])("normalizes a $raw.type argument", ({ raw, expected }) => {
    expect(normalizeArgument(raw)).toEqual(expected);
  });

  test("a get argument falls back to its string value when it has no dict_path_expression", () => {
    expect(normalizeArgument({ name: "n", type: "get", value: "a.b" })).toEqual({
      kind: "get",
      name: "n",
      expression: "a.b",
    });
  });

  test("a get argument with neither expression nor string value yields an empty expression", () => {
    expect(normalizeArgument({ name: "n", type: "get" })).toEqual({
      kind: "get",
      name: "n",
      expression: "",
    });
  });

  test("an mjson argument with no references map has no replacements", () => {
    expect(normalizeArgument({ name: "info", type: "mjson", value: [] })).toEqual({
      kind: "mjson",
      name: "info",
      value: [],
      replacements: [],
    });
  });

  // Malformed payloads degrade to an empty id/value rather than crash.
  test.each<{ raw: Reference.RawArgument; expected: Reference.Argument }>([
    {
      raw: { name: "n", type: "reference" },
      expected: { kind: "reference", name: "n", referenceId: "" },
    },
    {
      raw: { name: "n", type: "resource" },
      expected: { kind: "resource", name: "n", resourceId: "" },
    },
    {
      raw: { name: "n", type: "python_type" },
      expected: { kind: "python_type", name: "n", value: "" },
    },
  ])("degrades a $raw.type argument that is missing its payload", ({ raw, expected }) => {
    expect(normalizeArgument(raw)).toEqual(expected);
  });

  test("falls back to unknown for a kind this build does not model", () => {
    const raw: Reference.RawArgument = { name: "n", type: "future_kind", value: 1 };

    expect(normalizeArgument(raw)).toEqual({
      kind: "unknown",
      name: "n",
      type: "future_kind",
      raw,
    });
  });

  test("flattens an mjson argument's references into replacements", () => {
    const raw: Reference.RawArgument = {
      name: "info",
      type: "mjson",
      value: [null, null],
      references: {
        "$[0]": { id: "ref-a", name: "$[0]", type: "reference" },
        "$[1]": { id: "ref-b", name: "$[1]", type: "reference" },
      },
    };

    expect(normalizeArgument(raw)).toMatchObject({
      kind: "mjson",
      name: "info",
      value: [null, null],
      replacements: [
        { destination: "$[0]", attributeKey: "$", isWholeAttribute: false, referenceId: "ref-a" },
        { destination: "$[1]", attributeKey: "$", isWholeAttribute: false, referenceId: "ref-b" },
      ],
    });
  });
});

describe("normalizeReference", () => {
  test("keeps id and type and normalizes every argument", () => {
    const normalized = normalizeReference({
      id: "ref-1",
      type: "std::Environment",
      args: [{ name: "name", type: "literal", value: "X" }],
    });

    expect(normalized).toEqual({
      id: "ref-1",
      type: "std::Environment",
      args: [{ kind: "literal", name: "name", value: "X" }],
    });
  });
});

describe("indexReferences", () => {
  test("maps every reference by id, including ones reachable only through nesting", () => {
    const index = indexReferences(complianceReferences);

    expect(Object.keys(index)).toHaveLength(complianceReferences.length);
    complianceReferences.forEach((reference) => {
      expect(index[reference.id].type).toBe(reference.type);
    });
    // the level-3 node, reachable only through two levels of `compliance_status`
    expect(index["8e713d57-5c6c-33a7-9732-fd40c32324fc"]).toBeDefined();
  });
});
