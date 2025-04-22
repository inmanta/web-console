import React, { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useControlledQuery } from "./useControlledQuery";
import { QueryControlProvider } from "./QueryControlContext";

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

describe("useControlledQuery", () => {
  const mockedContext = jest.spyOn(require("./QueryControlContext"), "useQueryControl");

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should execute the query when queriesEnabled is true", async () => {
    const queryFn = jest.fn().mockResolvedValue("test data");
    const wrapper = setup();
    const { result } = renderHook(
      () =>
        useControlledQuery({
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
    mockedContext.mockReturnValue({ queriesEnabled: false });
    const wrapper = setup();
    const queryFn = jest.fn().mockResolvedValue("test data");

    const { result } = renderHook(
      () =>
        useControlledQuery({
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
    const queryFn = jest.fn().mockResolvedValue("test data");
    const wrapper = setup();
    const { result } = renderHook(
      () =>
        useControlledQuery({
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
