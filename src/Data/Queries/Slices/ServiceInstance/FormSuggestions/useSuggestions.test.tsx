import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { FormSuggestion } from "@/Core";
import { MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { words } from "@/UI/words";
import { SUGGESTION_NAMESPACES } from "./suggestionVariables";
import { useSuggestedValues } from "./useSuggestions";

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={testClient}>
      <MockedDependencyProvider>{children}</MockedDependencyProvider>
    </QueryClientProvider>
  );
};

const parameters = (parameter_name: string): FormSuggestion => ({
  type: "parameters",
  parameter_name,
});

// The values each (resolved) parameter name serves; assertions derive from this map.
const parameterValues: Record<string, string[]> = {
  files_Connection: ["connection-1", "connection-2"],
  files_Router: ["router-1"],
  "files_site A/berlin": ["encoded-1"],
  files_0fd8d40c: ["instance-1"],
};

const toSuggestions = (values: string[]) => values.map((value) => ({ label: value, value }));

describe("useSuggestedValues templated parameter names", () => {
  const requestedPaths: string[] = [];

  const server = setupServer(
    http.get("/api/v1/parameter/*", ({ request }) => {
      const path = new URL(request.url).pathname;

      requestedPaths.push(path);

      const name = decodeURIComponent(path.replace("/api/v1/parameter/", ""));
      const values = parameterValues[name];

      if (!values) {
        return HttpResponse.json({ message: "not found" }, { status: 404 });
      }

      return HttpResponse.json({ parameter: { metadata: { values } } });
    })
  );

  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    testClient.clear();
    requestedPaths.length = 0;
  });
  afterAll(() => server.close());

  test("GIVEN a templated parameter_name WHEN the context provides the variable THEN the resolved parameter is fetched", async () => {
    const { result } = renderHook(
      () =>
        useSuggestedValues(parameters("files_${entity_type}"), {
          entity_type: "Connection",
        }).useOneTime(),
      { wrapper }
    );

    await waitFor(() =>
      expect(result.current.data).toEqual(toSuggestions(parameterValues.files_Connection))
    );

    expect(requestedPaths).toEqual(["/api/v1/parameter/files_Connection"]);
  });

  test("GIVEN two different contexts THEN each fetches and caches its own parameter", async () => {
    const { result: connection } = renderHook(
      () =>
        useSuggestedValues(parameters("files_${entity_type}"), {
          entity_type: "Connection",
        }).useOneTime(),
      { wrapper }
    );
    const { result: router } = renderHook(
      () =>
        useSuggestedValues(parameters("files_${entity_type}"), {
          entity_type: "Router",
        }).useOneTime(),
      { wrapper }
    );

    await waitFor(() =>
      expect(connection.current.data).toEqual(toSuggestions(parameterValues.files_Connection))
    );
    await waitFor(() =>
      expect(router.current.data).toEqual(toSuggestions(parameterValues.files_Router))
    );

    // One fetch per resolved name: no cross-contamination through a shared key.
    expect(requestedPaths.sort()).toEqual([
      "/api/v1/parameter/files_Connection",
      "/api/v1/parameter/files_Router",
    ]);
  });

  test("GIVEN a name depending on ${instance_id} WHEN the context has no instance id (create form) THEN nothing is fetched and there are no suggestions", async () => {
    const { result } = renderHook(
      () =>
        useSuggestedValues(parameters("files_${instance_id}"), {
          entity_type: "Connection",
        }).useOneTime(),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
    expect(requestedPaths).toEqual([]);
  });

  test("GIVEN a name depending on ${instance_id} WHEN the context has an instance id (edit form) THEN the resolved parameter is fetched", async () => {
    const { result } = renderHook(
      () =>
        useSuggestedValues(parameters("files_${instance_id}"), {
          entity_type: "Connection",
          instance_id: "0fd8d40c",
        }).useOneTime(),
      { wrapper }
    );

    await waitFor(() =>
      expect(result.current.data).toEqual(toSuggestions(parameterValues.files_0fd8d40c))
    );

    expect(requestedPaths).toEqual(["/api/v1/parameter/files_0fd8d40c"]);
  });

  test("GIVEN a substituted value with special characters THEN it is URL-encoded in the request", async () => {
    const identifyingValue = "site A/berlin";
    const { result } = renderHook(
      () =>
        useSuggestedValues(parameters("files_${identifying_attribute}"), {
          identifying_attribute: identifyingValue,
        }).useOneTime(),
      { wrapper }
    );

    await waitFor(() =>
      expect(result.current.data).toEqual(
        toSuggestions(parameterValues[`files_${identifyingValue}`])
      )
    );

    expect(requestedPaths).toEqual([
      `/api/v1/parameter/files_${encodeURIComponent(identifyingValue)}`,
    ]);
  });

  test("GIVEN a source value changing in quick succession THEN only the settled name is fetched (debounced)", async () => {
    const { rerender } = renderHook(
      ({ context }) =>
        useSuggestedValues(parameters("files_${identifying_attribute}"), context).useOneTime(),
      { wrapper, initialProps: { context: {} as Record<string, string> } }
    );

    // Simulate typing into the identifying-attribute field: several updates
    // well within the debounce window.
    rerender({ context: { identifying_attribute: "R" } });
    rerender({ context: { identifying_attribute: "Ro" } });
    rerender({ context: { identifying_attribute: "Router" } });

    // Nothing fired yet - the debounce window has not elapsed.
    expect(requestedPaths).toEqual([]);

    // Once it settles, only the final name is fetched; the intermediate
    // "R"/"Ro" values never reach the network.
    await waitFor(() => expect(requestedPaths).toEqual(["/api/v1/parameter/files_Router"]));
  });

  test("GIVEN an unknown ${...} namespace THEN a model error is surfaced and nothing is fetched", async () => {
    const { result } = renderHook(
      () =>
        useSuggestedValues(parameters("files_${entity_typo}"), {
          entity_type: "Connection",
        }).useOneTime(),
      { wrapper }
    );

    // Reported as a model error (distinct from a query/fetch error), never fetched.
    expect(result.current.modelError).toEqual(
      words("inventory.form.suggestions.unknownVariable")(
        "entity_typo",
        SUGGESTION_NAMESPACES.join(", ")
      )
    );
    expect(result.current.error).toBeNull();
    expect(requestedPaths).toEqual([]);
  });
});

// Each environments node: attributes JSON (snake_case) projected via jsonpath.
const environmentNodes = [
  { id: "env-1", candidate_attributes: { network_name: "nw-a" } },
  { id: "env-2", candidate_attributes: { network_name: "nw-b" } },
];

const graphql = (query: FormSuggestion["query"]): FormSuggestion => ({ type: "graphql", query });

describe("useSuggestedValues graphql flavor", () => {
  const sentQueries: string[] = [];

  const server = setupServer(
    http.post("/api/v2/graphql", async ({ request }) => {
      const body = (await request.json()) as { query: string };

      sentQueries.push(body.query);

      // The endpoint double-wraps: graphql-request's request() strips the outer
      // `data`, leaving the `{ data: { <root> }, errors, extensions }` envelope
      // that consumers (and extractNodes) read via `.data`.
      const envelope = {
        data: { environments: { edges: environmentNodes.map((node) => ({ node })) } },
      };

      return HttpResponse.json({ data: envelope });
    })
  );

  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    testClient.clear();
    sentQueries.length = 0;
  });
  afterAll(() => server.close());

  test("GIVEN label + value projections THEN nodes are projected into { label, value }[]", async () => {
    const { result } = renderHook(
      () =>
        useSuggestedValues(
          graphql({ root: "environments", label: "candidate_attributes.network_name", value: "id" })
        ).useOneTime(),
      { wrapper }
    );

    await waitFor(() =>
      expect(result.current.data).toEqual(
        environmentNodes.map((node) => ({
          label: node.candidate_attributes.network_name,
          value: node.id,
        }))
      )
    );
    expect(result.current.modelError).toBeNull();
  });

  test("GIVEN a value-only projection THEN a list of values is produced", async () => {
    const { result } = renderHook(
      () => useSuggestedValues(graphql({ root: "environments", value: "id" })).useOneTime(),
      { wrapper }
    );

    await waitFor(() =>
      expect(result.current.data).toEqual(
        environmentNodes.map((node) => ({ label: node.id, value: node.id }))
      )
    );
  });

  test("GIVEN a ${...} filter value THEN it is resolved into the sent query", async () => {
    const { result } = renderHook(
      () =>
        useSuggestedValues(
          graphql({
            root: "environments",
            filter: { name: "${entity_type}" },
            value: "id",
          }),
          { entity_type: "network" }
        ).useOneTime(),
      { wrapper }
    );

    await waitFor(() => expect(result.current.data).not.toBeNull());
    expect(sentQueries[0]).toContain('name: "network"');
  });

  test("GIVEN a non-navigational projection path THEN a model error is surfaced and nothing is fetched", async () => {
    const { result } = renderHook(
      () =>
        useSuggestedValues(
          graphql({ root: "environments", label: "endpoints[*].name", value: "id" })
        ).useOneTime(),
      { wrapper }
    );

    expect(result.current.modelError).toEqual(
      words("inventory.form.suggestions.unsupportedPath")("endpoints[*].name")
    );
    expect(result.current.error).toBeNull();
    expect(sentQueries).toEqual([]);
  });

  test("GIVEN a filter depending on ${instance_id} WHEN absent (create form) THEN nothing is fetched", async () => {
    const { result } = renderHook(
      () =>
        useSuggestedValues(
          graphql({
            root: "environments",
            filter: { name: "${instance_id}" },
            value: "id",
          }),
          { entity_type: "network" }
        ).useOneTime(),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeUndefined();
    expect(sentQueries).toEqual([]);
  });

  test("GIVEN a graphql flavor without a query THEN a model error is surfaced", async () => {
    const { result } = renderHook(() => useSuggestedValues(graphql(undefined)).useOneTime(), {
      wrapper,
    });

    expect(result.current.modelError).toEqual(words("inventory.form.suggestions.invalidQuery"));
    expect(sentQueries).toEqual([]);
  });

  test("GIVEN a filter with a cascading ${form:...} reference (not yet resolvable) THEN the field is inert - no model error and no fetch", async () => {
    const { result } = renderHook(
      () =>
        useSuggestedValues(
          graphql({
            root: "serviceInstances",
            value: "$.id",
            filter: {
              serviceEntity: "uplink",
              "candidate_attributes.site": "${form:$.site}",
            },
          })
        ).useOneTime(),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // A valid (deferred) cascading reference is not a malformed annotation, and
    // it stays blocked until resolution lands rather than firing a query.
    expect(result.current.modelError).toBeNull();
    expect(result.current.data).toBeUndefined();
    expect(sentQueries).toEqual([]);
  });
});
