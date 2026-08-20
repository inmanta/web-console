import { FormSuggestion, Maybe } from "@/Core";
import {
  collectSuggestionReferences,
  getUnsupportedFieldPaths,
  resolveFieldReference,
} from "./fieldReferences";
import { FieldReference } from "./suggestionVariables";

const ref = (scope: "form" | "self", path: string): FieldReference => ({
  scope,
  path,
  raw: `${scope}.${path}`,
});

describe("resolveFieldReference", () => {
  const form = {
    site: "brussels",
    endpoints: [
      { name: "ep1", region: "eu" },
      { name: "ep2", region: "us" },
    ],
    nested: { attributes: {} },
  };

  it("resolves a form reference against the form root", () => {
    expect(resolveFieldReference(ref("form", "site"), { form, self: {} })).toEqual(
      Maybe.some("brussels")
    );
  });

  it("resolves a keyed jsonpath across a multi-cardinality relation", () => {
    expect(
      resolveFieldReference(ref("form", "endpoints[?@.name=='ep2'].region"), { form, self: {} })
    ).toEqual(Maybe.some("us"));
  });

  it("resolves a self reference against the field's own sub-tree, not the form root", () => {
    // `self` reads exactly the passed sub-tree: instance 2's site, never the form's.
    const self = { site: "antwerp" };

    expect(resolveFieldReference(ref("self", "site"), { form, self })).toEqual(
      Maybe.some("antwerp")
    );
  });

  it("coerces a numeric value to a string", () => {
    expect(
      resolveFieldReference(ref("form", "version"), { form: { version: 3 }, self: {} })
    ).toEqual(Maybe.some("3"));
  });

  it("yields none when the path resolves to no value (blocking)", () => {
    expect(resolveFieldReference(ref("form", "missing"), { form, self: {} })).toEqual(Maybe.none());
  });

  it("treats an empty-string value as no value (blocking), like an absent field", () => {
    expect(resolveFieldReference(ref("form", "site"), { form: { site: "" }, self: {} })).toEqual(
      Maybe.none()
    );
  });

  it("yields none when the path resolves to a non-scalar", () => {
    expect(resolveFieldReference(ref("form", "endpoints"), { form, self: {} })).toEqual(
      Maybe.none()
    );
  });
});

describe("collectSuggestionReferences", () => {
  it("returns an empty list for a literal or absent suggestion", () => {
    expect(collectSuggestionReferences(null)).toEqual([]);
    expect(collectSuggestionReferences({ type: "literal", values: ["a"] })).toEqual([]);
  });

  it("collects references from a parameters parameter_name", () => {
    const suggestion: FormSuggestion = {
      type: "parameters",
      parameter_name: "files_${entity_type}_${form.site}",
    };

    expect(collectSuggestionReferences(suggestion)).toEqual([
      { kind: "Context", namespace: "entity_type", raw: "entity_type" },
      { kind: "Field", scope: "form", path: "site", raw: "form.site" },
    ]);
  });

  it("collects references from graphql filter values at any depth, deduplicated", () => {
    const suggestion: FormSuggestion = {
      type: "graphql",
      query: {
        root: "serviceInstances",
        filter: {
          serviceEntity: "uplink",
          candidateAttributes: { site: "${form.site}", router: "${form.site}" },
        },
        value: "id",
      },
    };

    expect(collectSuggestionReferences(suggestion)).toEqual([
      { kind: "Field", scope: "form", path: "site", raw: "form.site" },
    ]);
  });
});

describe("getUnsupportedFieldPaths", () => {
  // `[*]` is a wildcard: it selects many nodes, not one, so it is outside the navigational
  // subset and gets flagged (surfaced to the author as a model error).
  it("flags a field reference whose jsonpath is outside the navigational subset", () => {
    const references = collectSuggestionReferences({
      type: "graphql",
      query: {
        root: "r",
        filter: { candidateAttributes: { site: "${form.endpoints[*].site}" } },
        value: "id",
      },
    });

    expect(getUnsupportedFieldPaths(references)).toEqual(["form.endpoints[*].site"]);
  });

  // Counterpart to the above: `[?@.name=='ep1']` is a single equality filter (allowed), so the
  // field path is accepted; `${entity_type}` is a context reference, never checked as a path.
  it("accepts navigational field-reference paths and ignores context references", () => {
    const references = collectSuggestionReferences({
      type: "parameters",
      parameter_name: "${entity_type}_${form.endpoints[?@.name=='ep1'].region}",
    });

    expect(getUnsupportedFieldPaths(references)).toEqual([]);
  });
});
