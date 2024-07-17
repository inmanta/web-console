import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { testInstance } from "@/UI/Components/Diagram/Mock";
import { useGetInstanceWithRelations } from "./useGetInstanceWithRelations";

export const server = setupServer(
  http.get("/lsm/v1/service_inventory", async (params) => {
    if (params.request.url.match(/test_id/)) {
      return HttpResponse.json({
        data: {
          ...testInstance,
          id: "test_id",
          referenced_by: ["test_mpn_id"],
        },
      });
    }
    return HttpResponse.json({
      data: { ...testInstance, id: "test_mpn_id" },
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

test("if the fetched instance has referenced instance(s), then query will return the given instance with that related instance(s)", async () => {
  const { result } = renderHook(
    () => useGetInstanceWithRelations("test_id", "env").useOneTime(),
    {
      wrapper: createWrapper(),
    },
  );

  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  expect(result.current.data).toBeDefined();
  expect(result.current.data?.instance.id).toEqual("test_id");
  expect(result.current.data?.relatedInstances).toHaveLength(1);
  expect(result.current.data?.relatedInstances[0].id).toEqual("test_mpn_id");
});

test("when instance returned has not referenced instance(s), then the query will return the given instance without relatedInstances", async () => {
  const { result } = renderHook(
    () => useGetInstanceWithRelations("test_mpn_id", "env").useOneTime(),
    {
      wrapper: createWrapper(),
    },
  );

  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  expect(result.current.data).toBeDefined();
  expect(result.current.data?.instance.id).toEqual("test_mpn_id");
  expect(result.current.data?.relatedInstances).toHaveLength(0);
});
