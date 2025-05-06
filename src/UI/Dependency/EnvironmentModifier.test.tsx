import React, { act } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { EnvironmentDetails, EnvironmentSettings } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { useEnvironmentModifierImpl } from "./EnvironmentModifier";

describe("EnvironmentModifier", () => {
  const server = setupServer();

  beforeAll(() => {
    server.listen();
  });

  beforeEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  const wrapper = ({ children }) => (
    <QueryClientProvider client={testClient}>{children}</QueryClientProvider>
  );

  test("Given the environmentModifier When the server compile setting is requested Then returns the correct value", async () => {
    server.use(
      http.get("/api/v2/environment_settings", () => {
        return HttpResponse.json({
          data: {
            settings: {},
            definition: EnvironmentSettings.definition,
          },
        });
      })
    );

    const { result } = renderHook(() => useEnvironmentModifierImpl(), { wrapper });
    // No setting is specified, and the default is true
    await act(() => {
      result.current.setEnvironment(EnvironmentDetails.a);
    });

    await waitFor(() => {
      expect(result.current.useIsServerCompileEnabled()).toBe(true);
    });

    // Set the option explicitly to false
    await act(() => {
      result.current.setEnvironment({
        ...EnvironmentDetails.a,
        settings: {
          ...EnvironmentDetails.a.settings,
          server_compile: false,
        },
      });
    });

    expect(result.current.useIsServerCompileEnabled()).toBe(false);
  });

  test("given the environmentModifier When the missing setting is requested and the definition is not missing Then return definition default value", async () => {
    server.use(
      http.get("/api/v2/environment_settings", () => {
        return HttpResponse.json({
          data: {
            settings: {},
            definition: EnvironmentSettings.definition,
          },
        });
      })
    );
    const { result } = renderHook(() => useEnvironmentModifierImpl(), { wrapper });

    await act(() => {
      result.current.setEnvironment({
        ...EnvironmentDetails.a,
        settings: {},
      });
    });

    //default value from definition is true
    await waitFor(() => {
      expect(result.current.useIsServerCompileEnabled()).toBe(true);
    });
  });

  test("Given the environmentModifier When the missing setting is requested and the definition is missing Then return false without throwing an error", async () => {
    delete EnvironmentSettings.definition.server_compile;

    server.use(
      http.get("/api/v2/environment_settings", () => {
        return HttpResponse.json({
          data: {
            settings: {},
            definition: {},
          },
        });
      })
    );
    const consoleError = jest.spyOn(console, "error");

    const { result } = renderHook(() => useEnvironmentModifierImpl(), { wrapper });

    await waitFor(() => {
      expect(result.current.useIsServerCompileEnabled()).toBe(false);
    });
    expect(consoleError).not.toHaveBeenCalled();
  });
});
