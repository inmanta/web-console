import {
  extractVariables,
  isKnownNamespace,
  substituteVariables,
  TEMPLATE_NAMESPACES,
} from "./templateVariables";

describe("extractVariables", () => {
  it("returns an empty list for a template without variables", () => {
    expect(extractVariables("topology_files")).toEqual([]);
    expect(extractVariables("")).toEqual([]);
  });

  it("extracts a single variable as data", () => {
    expect(extractVariables("topology_files_${entity_type}")).toEqual([
      { namespace: "entity_type" },
    ]);
  });

  it("extracts multiple variables in order of first appearance", () => {
    expect(extractVariables("${entity_type}_${identifying_attribute}_${instance_id}")).toEqual([
      { namespace: "entity_type" },
      { namespace: "identifying_attribute" },
      { namespace: "instance_id" },
    ]);
  });

  it("deduplicates repeated references to the same variable", () => {
    expect(extractVariables("${entity_type}_files_${entity_type}")).toEqual([
      { namespace: "entity_type" },
    ]);
  });

  it("also extracts unknown namespaces, so callers can flag them", () => {
    const variables = extractVariables("files_${entity_typo}");

    expect(variables).toEqual([{ namespace: "entity_typo" }]);
    expect(variables.every(({ namespace }) => isKnownNamespace(namespace))).toBe(false);
  });
});

describe("isKnownNamespace", () => {
  it.each(TEMPLATE_NAMESPACES)("accepts the supported namespace %s", (namespace) => {
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

  it("leaves a template without variables untouched", () => {
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
});
