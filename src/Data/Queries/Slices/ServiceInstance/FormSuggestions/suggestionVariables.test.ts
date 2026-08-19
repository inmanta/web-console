import {
  extractReferences,
  extractVariables,
  isKnownNamespace,
  parseReference,
  substituteVariables,
  SUGGESTION_NAMESPACES,
} from "./suggestionVariables";

describe("extractVariables", () => {
  it("returns an empty list for a parameter name without variables", () => {
    expect(extractVariables("topology_files")).toEqual([]);
    expect(extractVariables("")).toEqual([]);
  });

  it("extracts a single variable as data", () => {
    expect(extractVariables("topology_files_${entity_type}")).toEqual(["entity_type"]);
  });

  it("extracts multiple variables in order of first appearance", () => {
    expect(extractVariables("${entity_type}_${identifying_attribute}_${instance_id}")).toEqual([
      "entity_type",
      "identifying_attribute",
      "instance_id",
    ]);
  });

  it("deduplicates repeated references to the same variable", () => {
    expect(extractVariables("${entity_type}_files_${entity_type}")).toEqual(["entity_type"]);
  });

  it("also extracts unknown namespaces, so callers can flag them", () => {
    const variables = extractVariables("files_${entity_typo}");

    expect(variables).toEqual(["entity_typo"]);
    expect(variables.every((namespace) => isKnownNamespace(namespace))).toBe(false);
  });
});

describe("isKnownNamespace", () => {
  it.each(SUGGESTION_NAMESPACES)("accepts the supported namespace %s", (namespace) => {
    expect(isKnownNamespace(namespace)).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isKnownNamespace("entity_typo")).toBe(false);
    expect(isKnownNamespace("form.other_field")).toBe(false);
    expect(isKnownNamespace("")).toBe(false);
  });
});

describe("substituteVariables", () => {
  it("substitutes every variable with its value", () => {
    expect(
      substituteVariables("${entity_type}_${instance_id}", {
        entity_type: "Connection",
        instance_id: "0fd8d40c",
      })
    ).toEqual("Connection_0fd8d40c");
  });

  it("leaves a parameter name without variables untouched", () => {
    expect(substituteVariables("topology_files", { entity_type: "Connection" })).toEqual(
      "topology_files"
    );
  });

  it("URL-encodes substituted values", () => {
    expect(
      substituteVariables("files_${identifying_attribute}", {
        identifying_attribute: "site A/berlin?",
      })
    ).toEqual(`files_${encodeURIComponent("site A/berlin?")}`);
  });

  it("substitutes an absent value with an empty string", () => {
    expect(substituteVariables("files_${instance_id}", {})).toEqual("files_");
  });

  it("substitutes a field reference keyed by its raw ${...} content", () => {
    expect(substituteVariables("${form.site}", { "form.site": "brussels" })).toEqual("brussels");
  });

  it("substitutes a field reference embedded in a larger value", () => {
    // identity encoder mirrors the graphql path, which escapes the value itself.
    expect(
      substituteVariables("%${form.site}%", { "form.site": "brussels" }, (raw) => raw)
    ).toEqual("%brussels%");
  });
});

describe("parseReference", () => {
  it.each(SUGGESTION_NAMESPACES)("classifies the context namespace %s", (namespace) => {
    expect(parseReference(namespace)).toEqual({ kind: "context", namespace, raw: namespace });
  });

  it("classifies a form field reference, splitting scope from path on the first dot", () => {
    expect(parseReference("form.candidate_attributes.name")).toEqual({
      kind: "field",
      scope: "form",
      path: "candidate_attributes.name",
      raw: "form.candidate_attributes.name",
    });
  });

  it("classifies a self field reference", () => {
    expect(parseReference("self.site")).toEqual({
      kind: "field",
      scope: "self",
      path: "site",
      raw: "self.site",
    });
  });

  it("keeps a leading $ in the field reference path", () => {
    expect(parseReference("form.$.site")).toEqual({
      kind: "field",
      scope: "form",
      path: "$.site",
      raw: "form.$.site",
    });
  });

  it("treats a scope keyword without a path as unknown", () => {
    expect(parseReference("form.")).toEqual({ kind: "unknown", raw: "form." });
    expect(parseReference("form")).toEqual({ kind: "unknown", raw: "form" });
  });

  it("treats an unsupported namespace as unknown", () => {
    expect(parseReference("entity_typo")).toEqual({ kind: "unknown", raw: "entity_typo" });
  });
});

describe("extractReferences", () => {
  it("returns an empty list for a string without references", () => {
    expect(extractReferences("topology_files")).toEqual([]);
  });

  it("classifies each reference, deduplicated and stable in order", () => {
    expect(extractReferences("${entity_type}_${form.site}_${entity_type}")).toEqual([
      { kind: "context", namespace: "entity_type", raw: "entity_type" },
      { kind: "field", scope: "form", path: "site", raw: "form.site" },
    ]);
  });

  it("finds a reference embedded in a larger value", () => {
    expect(extractReferences("%${form.site}%")).toEqual([
      { kind: "field", scope: "form", path: "site", raw: "form.site" },
    ]);
  });
});
