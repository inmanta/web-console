import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { useGetMetadata } from "./useGetMetadata";

export const server = setupServer(
  http.get("/lsm/v1/service_inventory/*/*/metadata/*", async () => {
    return HttpResponse.json({
      data: "metadata_string",
    });
  }),
);

// Establish API mocking before all tests.
beforeAll(() => server.listen());
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());
// Clean up after the tests are finished.
afterAll(() => server.close());

const createWrapper = () => {
  // creates a new QueryClient for each test
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

test("my first test", async () => {
  const { result } = renderHook(
    () => useGetMetadata("env", "service_entity", "id", "key", 5).useOneTime(),
    {
      wrapper: createWrapper(),
    },
  );

  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  expect(result.current.data).toBeDefined();
  expect(result.current.data).toEqual("metadata_string");
});

test("when servers return 404 query shouldn't throw error, but return undefined instead", async () => {
  server.use(
    http.get("/lsm/v1/service_inventory/*/*/metadata/*", async () => {
      return HttpResponse.json(
        {
          message: "Request or referenced resource does not exist.",
        },
        {
          status: 404,
        },
      );
    }),
  );
  const { result } = renderHook(
    () => useGetMetadata("env", "service_entity", "id", "key", 5).useOneTime(),
    {
      wrapper: createWrapper(),
    },
  );

  // wait until the query has transitioned to success state
  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  expect(result.current.isError).toBeFalsy();
});
