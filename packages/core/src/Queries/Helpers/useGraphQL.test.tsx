import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { words } from "@inmanta/web-console-core";
import { MockedDependencyProvider } from "@inmanta/web-console-test-utils";
import { testClient } from "@inmanta/web-console-test-utils/Utils/react-query-setup";
import { useGraphQLRequest } from "./useGraphQL";

const environmentsData = { environments: { edges: [] } };

const wrapper = ({ children }) => (
  <QueryClientProvider client={testClient}>
    <MockedDependencyProvider>{children}</MockedDependencyProvider>
  </QueryClientProvider>
);

const renderGraphQLRequest = () =>
  renderHook(() => useGraphQLRequest("query { environments { edges { node { id } } } }"), {
    wrapper,
  }).result.current;

describe("useGraphQLRequest", () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    testClient.clear();
  });
  afterAll(() => server.close());

  it("GIVEN a JSON response THEN it resolves to the data of the envelope", async () => {
    server.use(
      http.post("/api/v2/graphql", () =>
        HttpResponse.json({ data: environmentsData, errors: null, extensions: {} })
      )
    );

    await expect(renderGraphQLRequest()()).resolves.toEqual(environmentsData);
  });

  it("GIVEN an empty body with status 200 THEN it rejects with an empty response error", async () => {
    server.use(http.post("/api/v2/graphql", () => new HttpResponse(null, { status: 200 })));

    await expect(renderGraphQLRequest()()).rejects.toMatchObject({
      message: words("error.response.empty"),
      status: 200,
    });
  });
});
