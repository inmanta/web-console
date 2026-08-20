import { GraphQLSuggestionQuery } from "@/Core";
import {
  buildSuggestionQuery,
  extractNodes,
  getFilterVariables,
  getInvalidFilterKeys,
  getUnsupportedPaths,
  projectNodes,
} from "./graphqlSuggestions";
import { normalizeSuggestions } from "./helpers";

const edge = (node: unknown) => ({ node });

describe("buildSuggestionQuery", () => {
  it("omits the argument list entirely when there is no filter", () => {
    const query: GraphQLSuggestionQuery = { root: "environments", value: "id" };

    const result = buildSuggestionQuery(query, {});

    // no filter -> no argument parens (`environments()` is invalid GraphQL); paging
    // and ordering are the author's concern, so nothing is imposed here.
    expect(result).toContain("environments {");
    expect(result).not.toContain("environments(");
    expect(result).not.toContain("filter:");
    expect(result).not.toContain("first");
    // selection set derived from the projection paths
    expect(result).toContain("edges { node { id } }");
  });

  it("selects the top-level field of each projection path, deduplicated", () => {
    const query: GraphQLSuggestionQuery = {
      root: "serviceInstances",
      label: "candidate_attributes.network_name",
      value: "candidate_attributes.id",
    };

    const result = buildSuggestionQuery(query, {});

    expect(result).toContain("node { candidate_attributes }");
  });

  it("serializes literal filter values into GraphQL argument syntax", () => {
    const query: GraphQLSuggestionQuery = {
      root: "serviceInstances",
      filter: { serviceEntity: "network", version: 3, active: true },
      value: "id",
    };

    const result = buildSuggestionQuery(query, {});

    expect(result).toContain('filter: {serviceEntity: "network", version: 3, active: true}');
  });

  it("substitutes ${...} filter values from the provided variables", () => {
    const query: GraphQLSuggestionQuery = {
      root: "serviceInstances",
      filter: { serviceEntity: "${entity_type}" },
      value: "id",
    };

    const result = buildSuggestionQuery(query, { entity_type: "network" });

    expect(result).toContain('serviceEntity: "network"');
  });

  it("escapes filter values so they cannot break out of the query (injection-safe)", () => {
    const query: GraphQLSuggestionQuery = {
      root: "serviceInstances",
      filter: { name: "${identifying_attribute}" },
      value: "id",
    };

    const result = buildSuggestionQuery(query, {
      identifying_attribute: 'evil") { injected } #',
    });

    // the whole user value stays inside a single escaped string literal...
    expect(result).toContain(JSON.stringify('evil") { injected } #'));
    // ...so the unescaped quote+brace that would break out never appears
    expect(result).not.toContain('evil") {');
  });

  it("serializes nested operator objects and arrays faithfully", () => {
    const query: GraphQLSuggestionQuery = {
      root: "resources",
      filter: {
        isOrphan: false,
        resourceType: { contains: ["%vm%", "%net%"] },
      },
      value: "id",
    };

    const result = buildSuggestionQuery(query, {});

    expect(result).toContain("isOrphan: false");
    expect(result).toContain('resourceType: {contains: ["%vm%", "%net%"]}');
  });

  it("keeps ${...} substitution inside a nested value injection-safe", () => {
    const query: GraphQLSuggestionQuery = {
      root: "serviceInstances",
      filter: { attributes: { name: { eq: "${identifying_attribute}" } } },
      value: "id",
    };

    const result = buildSuggestionQuery(query, {
      identifying_attribute: 'evil") { injected } #',
    });

    // the nested user value is still escaped into a single string literal...
    expect(result).toContain(JSON.stringify('evil") { injected } #'));
    // ...so the breakout sequence never appears even at depth
    expect(result).not.toContain('evil") {');
  });
});

describe("extractNodes", () => {
  // useGraphQLRequest hands back the GraphQL envelope: { data: { <root>: ... } }.
  const data = { data: { environments: { edges: [edge({ id: "a" }), edge({ id: "b" })] } } };

  it("pulls the node list out of the { data: { <root> } } envelope", () => {
    expect(extractNodes(data, "environments")).toEqual([{ id: "a" }, { id: "b" }]);
  });

  it.each([
    ["null data", null],
    ["errored query (data: null)", { data: null }],
    ["missing root", { data: { other: { edges: [] } } }],
    ["malformed connection", { data: { environments: {} } }],
    ["an unwrapped response (no envelope)", { environments: { edges: [edge({ id: "a" })] } }],
  ])("returns an empty list for %s", (_label, input) => {
    expect(extractNodes(input, "environments")).toEqual([]);
  });
});

describe("projectNodes", () => {
  const nodes = [
    { id: "1", candidate_attributes: { network_name: "nw-a" } },
    { id: "2", candidate_attributes: { network_name: "nw-b" } },
  ];

  it("value-only yields a list of bare values", () => {
    const query: GraphQLSuggestionQuery = { root: "r", value: "id" };

    expect(normalizeSuggestions(projectNodes(nodes, query))).toEqual([
      { label: "1", value: "1" },
      { label: "2", value: "2" },
    ]);
  });

  it("label + value yields labels mapped to values via jsonpath projection", () => {
    const query: GraphQLSuggestionQuery = {
      root: "r",
      label: "candidate_attributes.network_name",
      value: "id",
    };

    expect(normalizeSuggestions(projectNodes(nodes, query))).toEqual([
      { label: "nw-a", value: "1" },
      { label: "nw-b", value: "2" },
    ]);
  });

  it("falls back to the value when the label path resolves to nothing", () => {
    const query: GraphQLSuggestionQuery = { root: "r", label: "missing.path", value: "id" };

    expect(normalizeSuggestions(projectNodes(nodes, query))).toEqual([
      { label: "1", value: "1" },
      { label: "2", value: "2" },
    ]);
  });

  it("drops a node whose value path resolves to no scalar", () => {
    const query: GraphQLSuggestionQuery = { root: "r", value: "candidate_attributes" };

    // candidate_attributes is an object, not a submittable scalar
    expect(projectNodes(nodes, query)).toEqual([]);
  });
});

describe("getFilterVariables", () => {
  it("collects the ${...} namespaces across all string filter values, deduplicated", () => {
    const query: GraphQLSuggestionQuery = {
      root: "r",
      filter: { a: "${entity_type}", b: "${instance_id}-${entity_type}", c: 5 },
      value: "id",
    };

    expect(getFilterVariables(query)).toEqual(["entity_type", "instance_id"]);
  });

  it("collects ${...} namespaces from nested filter values", () => {
    const query: GraphQLSuggestionQuery = {
      root: "r",
      filter: {
        service: "${entity_type}",
        attributes: { name: { eq: "${identifying_attribute}" } },
      },
      value: "id",
    };

    expect(getFilterVariables(query)).toEqual(["entity_type", "identifying_attribute"]);
  });

  it("returns an empty list when there is no filter", () => {
    expect(getFilterVariables({ root: "r", value: "id" })).toEqual([]);
  });
});

describe("getUnsupportedPaths", () => {
  it("flags projection paths outside the navigational subset", () => {
    const query: GraphQLSuggestionQuery = {
      root: "r",
      label: "endpoints[*].name", // wildcard - unsupported
      value: "id",
    };

    expect(getUnsupportedPaths(query)).toEqual(["endpoints[*].name"]);
  });

  it("accepts navigational projection paths", () => {
    const query: GraphQLSuggestionQuery = {
      root: "r",
      label: "candidate_attributes.network_name",
      value: "endpoints[?@.primary=='true'].id",
    };

    expect(getUnsupportedPaths(query)).toEqual([]);
  });
});

describe("getInvalidFilterKeys", () => {
  it("flags a dotted key (a jsonpath used as a filter field)", () => {
    const query: GraphQLSuggestionQuery = {
      root: "serviceInstances",
      filter: { serviceEntity: "uplink", "candidate_attributes.site": "brussels" },
      value: "$.id",
    };

    expect(getInvalidFilterKeys(query)).toEqual(["candidate_attributes.site"]);
  });

  it("flags an invalid key nested inside an operator object", () => {
    const query: GraphQLSuggestionQuery = {
      root: "r",
      filter: { candidateAttributes: { "site.region": "eu" } },
      value: "id",
    };

    expect(getInvalidFilterKeys(query)).toEqual(["site.region"]);
  });

  it("accepts valid flat and nested GraphQL field names", () => {
    const query: GraphQLSuggestionQuery = {
      root: "r",
      filter: {
        serviceEntity: "uplink",
        candidateAttributes: { site: "brussels" },
        resourceType: { contains: ["%vm%"] },
      },
      value: "id",
    };

    expect(getInvalidFilterKeys(query)).toEqual([]);
  });

  it("returns an empty list when there is no filter", () => {
    expect(getInvalidFilterKeys({ root: "r", value: "id" })).toEqual([]);
  });
});
