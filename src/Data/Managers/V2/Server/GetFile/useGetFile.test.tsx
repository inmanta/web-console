import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { useGetFile } from "./useGetFile";

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={testClient}>
      <MockedDependencyProvider>{children}</MockedDependencyProvider>
    </QueryClientProvider>
  );
};

describe("useGetFile", () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const fileId = "test-file-123";
  const encodedFileId = encodeURIComponent(fileId);

  test("successfully fetches and decodes base64 file content", async () => {
    const fileContent = "Hello, World!";
    const base64Content = btoa(fileContent);

    server.use(
      http.get(`/api/v1/file/${encodedFileId}`, () => {
        return HttpResponse.json(
          { content: base64Content },
          {
            headers: {
              "x-environment-id": "test-env",
            },
          }
        );
      })
    );

    const { result } = renderHook(() => useGetFile(fileId), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBe(fileContent);
  });

  test("handles error message in response", async () => {
    const errorMessage = "File not found";

    server.use(
      http.get(`/api/v1/file/${encodedFileId}`, () => {
        return HttpResponse.json({ message: errorMessage });
      })
    );

    const { result } = renderHook(() => useGetFile(fileId), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBe(errorMessage);
  });

  test("handles empty response", async () => {
    server.use(
      http.get(`/api/v1/file/${encodedFileId}`, () => {
        return HttpResponse.json({});
      })
    );

    const { result } = renderHook(() => useGetFile(fileId), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBe("No data");
  });

  test("handles server error", async () => {
    server.use(
      http.get(`/api/v1/file/${encodedFileId}`, () => {
        return HttpResponse.json({ message: "Internal server error" }, { status: 500 });
      })
    );

    const { result } = renderHook(() => useGetFile(fileId), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  test("properly encodes file ID with special characters", async () => {
    const specialFileId = "test/file?with#special&chars";
    const encodedSpecialFileId = encodeURIComponent(specialFileId);
    const fileContent = "Special content";
    const base64Content = btoa(fileContent);

    server.use(
      http.get(`/api/v1/file/${encodedSpecialFileId}`, () => {
        return HttpResponse.json({ content: base64Content });
      })
    );

    const { result } = renderHook(() => useGetFile(specialFileId), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBe(fileContent);
  });

  test("handles invalid base64 content", async () => {
    const invalidBase64 = "not-valid-base64!@#";

    server.use(
      http.get(`/api/v1/file/${encodedFileId}`, () => {
        return HttpResponse.json({ content: invalidBase64 });
      })
    );

    const { result } = renderHook(() => useGetFile(fileId), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // When base64 decoding fails, it should return the original content
    expect(result.current.data).toBe(invalidBase64);
  });
});
