import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { words } from "@inmanta/web-console-core";
import { TypedDocumentString } from "@inmanta/web-console-core/GraphQL/generated/graphql";
import { MockedDependencyProvider } from "@inmanta/web-console-test-utils";
import { testClient } from "@inmanta/web-console-test-utils/Utils/react-query-setup";
import { setupTestServer } from "@inmanta/web-console-test-utils/Utils/setupTestServer";
import { GraphQLResponseBody, useGraphQLRequest } from "./useGraphQL";

const environmentsData = { environments: { edges: [] } };

const environmentsBody: GraphQLResponseBody<typeof environmentsData> = {
  data: { data: environmentsData, errors: null, extensions: {} },
};

const wrapper = ({ children }) => (
  <QueryClientProvider client={testClient}>
    <MockedDependencyProvider>{children}</MockedDependencyProvider>
  </QueryClientProvider>
);

const environmentsQuery = new TypedDocumentString<typeof environmentsData, Record<string, never>>(
  "query { environments { edges { node { id } } } }"
);

const renderExecute = () => renderHook(() => useGraphQLRequest(), { wrapper }).result.current;

describe("useGraphQLRequest", () => {
  const server = setupTestServer();

  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    testClient.clear();
  });
  afterAll(() => server.close());

  it("GIVEN a JSON response THEN it resolves to the query result", async () => {
    server.use(http.post("/api/v2/graphql", () => HttpResponse.json(environmentsBody)));

    await expect(renderExecute()(environmentsQuery)).resolves.toEqual(environmentsData);
  });

  it("GIVEN a query with variables THEN it posts the query string and the variables as JSON", async () => {
    let requestBody: unknown;
    let contentType: string | null = null;
    const query = new TypedDocumentString<typeof environmentsData, { first: number }>(
      "query Q($first: Int) { environments(first: $first) { edges { node { id } } } }"
    );

    server.use(
      http.post("/api/v2/graphql", async ({ request }) => {
        requestBody = await request.json();
        contentType = request.headers.get("Content-Type");

        return HttpResponse.json(environmentsBody);
      })
    );

    await renderExecute()(query, { first: 2 });

    expect(requestBody).toEqual({ query: query.toString(), variables: { first: 2 } });
    expect(contentType).toBe("application/json");
  });

  it("GIVEN a body with GraphQL errors THEN it rejects with those errors", async () => {
    server.use(
      http.post("/api/v2/graphql", () =>
        HttpResponse.json({ data: { data: null, errors: ["first", "second"], extensions: {} } })
      )
    );

    await expect(renderExecute()(environmentsQuery)).rejects.toMatchObject({
      message: "first, second",
      status: 200,
    });
  });

  it("GIVEN an empty body with status 200 THEN it rejects with an empty response error", async () => {
    server.use(http.post("/api/v2/graphql", () => new HttpResponse(null, { status: 200 })));

    await expect(renderExecute()(environmentsQuery)).rejects.toMatchObject({
      message: words("error.response.empty"),
      status: 200,
    });
  });
});
