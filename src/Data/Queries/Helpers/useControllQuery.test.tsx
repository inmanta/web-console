import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryControlProvider } from "./QueryControlContext";
import * as QueryControlContext from "./QueryControlContext";
import { useCustomQuery } from "./useCustomQuery";

const setup = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <QueryControlProvider>{children}</QueryControlProvider>
    </QueryClientProvider>
  );

  return wrapper;
};

describe("useCustomQuery", () => {
  beforeEach(() => {
    vi.spyOn(QueryControlContext, "useQueryControl").mockReturnValue({
      queriesEnabled: true,
      enableQueries: vi.fn(),
      disableQueries: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should execute the query when queriesEnabled is true", async () => {
    const queryFn = vi.fn().mockResolvedValue("test data");
    const wrapper = setup();
    const { result } = renderHook(
      () =>
        useCustomQuery({
          queryKey: ["test-key"],
          queryFn,
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(result.current.data).toBe("test data");
  });

  it("should not execute the query when queriesEnabled is false", async () => {
    vi.mocked(QueryControlContext.useQueryControl).mockReturnValue({
      queriesEnabled: false,
      enableQueries: vi.fn(),
      disableQueries: vi.fn(),
    });
    const wrapper = setup();
    const queryFn = vi.fn().mockResolvedValue("test data");

    const { result } = renderHook(
      () =>
        useCustomQuery({
          queryKey: ["test-key"],
          queryFn,
        }),
      { wrapper }
    );

    // Wait a bit to ensure the query doesn't execute
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(queryFn).not.toHaveBeenCalled();
    expect(result.current.isPending).toBe(true);
  });

  it("should respect the enabled option when it's explicitly set to false", async () => {
    const queryFn = vi.fn().mockResolvedValue("test data");
    const wrapper = setup();
    const { result } = renderHook(
      () =>
        useCustomQuery({
          queryKey: ["test-key"],
          queryFn,
          enabled: false,
        }),
      { wrapper }
    );

    // Wait a bit to ensure the query doesn't execute
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(queryFn).not.toHaveBeenCalled();
    expect(result.current.isPending).toBe(true);
  });
});
