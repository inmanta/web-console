import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { words } from "@inmanta/web-console-core";
import { MockedDependencyProvider } from "@inmanta/web-console-test-utils";
import { testClient } from "@inmanta/web-console-test-utils/Utils/react-query-setup";
import { useGet, usePost } from "./useQueries";

const environmentId = "c85c0a64-ed45-4cba-bdc5-703f65a225f7";
const projectsPath = "/api/v2/project";

const wrapper = ({ children }) => (
  <QueryClientProvider client={testClient}>
    <MockedDependencyProvider>{children}</MockedDependencyProvider>
  </QueryClientProvider>
);

describe("useQueries", () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    testClient.clear();
  });
  afterAll(() => server.close());

  it("GIVEN a GET request with an empty body THEN it rejects with an empty response error", async () => {
    server.use(http.get(projectsPath, () => new HttpResponse(null, { status: 200 })));
    const get = renderHook(() => useGet(environmentId), { wrapper }).result.current;

    await expect(get(projectsPath)).rejects.toMatchObject({
      message: words("error.response.empty"),
      status: 200,
    });
  });

  it("GIVEN a POST request that expects a response body and gets an empty one THEN it rejects with an empty response error", async () => {
    server.use(http.post(projectsPath, () => new HttpResponse(null, { status: 201 })));
    const post = renderHook(() => usePost(environmentId, { expectResponseBody: true }), {
      wrapper,
    }).result.current;

    await expect(post(projectsPath, {})).rejects.toMatchObject({
      message: words("error.response.empty"),
      status: 201,
    });
  });

  it("GIVEN a POST request that doesn't require a response body and gets an empty one THEN it resolves to undefined", async () => {
    server.use(http.post(projectsPath, () => new HttpResponse(null, { status: 200 })));
    const post = renderHook(() => usePost(environmentId), { wrapper }).result.current;

    await expect(post(projectsPath, {})).resolves.toBeUndefined();
  });
});
