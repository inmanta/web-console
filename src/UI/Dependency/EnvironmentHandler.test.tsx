import React from "react";
import { createMemoryHistory } from "@remix-run/router";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { Environment, EnvironmentSettings } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { PrimaryRouteManager } from "@/UI/Routing";
import { EnvironmentHandlerImpl } from ".";

const routeManager = PrimaryRouteManager("");

describe("EnvironmentHandler", () => {
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

  test("EnvironmentHandler updates environment correctly", async () => {
    server.use(
      http.get("/api/v2/environment_settings", () => {
        return HttpResponse.json({
          data: {
            settings: EnvironmentSettings,
            definition: EnvironmentSettings.definition,
          },
        });
      })
    );

    const history = createMemoryHistory();
    const env = Environment.filterable[0];

    const { result } = renderHook(
      () => EnvironmentHandlerImpl(() => history.location, routeManager, Environment.filterable),
      { wrapper }
    );

    await act(async () => {
      result.current.set(history.push, history.location, env.id);
    });

    expect(history.location.search).toEqual(`?env=${env.id}`);
  });

  test("EnvironmentHandler uses name and Id correctly", async () => {
    server.use(
      http.get("/api/v2/environment_settings", () => {
        return HttpResponse.json({
          data: {
            settings: EnvironmentSettings,
            definition: EnvironmentSettings.definition,
          },
        });
      })
    );
    const history = createMemoryHistory();
    const env = Environment.filterable[0];

    const { result, rerender } = renderHook(
      () => EnvironmentHandlerImpl(() => history.location, routeManager, Environment.filterable),
      { wrapper }
    );

    await act(async () => {
      result.current.set(history.push, history.location, env.id);
    });

    //rerender to get the new environment from the history location
    await act(async () => {
      rerender();
    });

    expect(result.current.useName()).toEqual(env.name);
    expect(result.current.useId()).toEqual(env.id);
  });

  test("EnvironmentHandler determines selected environment correctly", () => {
    const history = createMemoryHistory();

    const { result } = renderHook(
      () => EnvironmentHandlerImpl(() => history.location, routeManager, Environment.filterable),
      { wrapper }
    );

    expect(result.current.determineSelected([], history.location.search)).toBeUndefined();
    history.push(`?env=${Environment.filterable[0].id}`);
    expect(result.current.determineSelected([], history.location.search)).toBeUndefined();

    expect(
      result.current.determineSelected(Environment.filterable, history.location.search)
    ).toEqual(Environment.filterable[0]);

    result.current.set(history.push, history.location, Environment.filterable[1].id);
    expect(
      result.current.determineSelected(Environment.filterable, history.location.search)
    ).toEqual(Environment.filterable[1]);
  });

  test("Given the environmentModifier When the server compile setting is requested Then returns the correct value", async () => {
    let counter = 0;
    server.use(
      http.get("/api/v2/environment_settings", () => {
        if (counter === 0) {
          counter++;
          return HttpResponse.json({
            data: {
              settings: {
                enable_lsm_expert_mode: false,
                server_compile: true,
              },
              definition: EnvironmentSettings.definition,
            },
          });
        }
        return HttpResponse.json({
          data: {
            settings: {
              enable_lsm_expert_mode: false,
              server_compile: false,
            },
            definition: EnvironmentSettings.definition,
          },
        });
      })
    );
    const history = createMemoryHistory();

    const { result, rerender } = renderHook(
      () => EnvironmentHandlerImpl(() => history.location, routeManager, Environment.filterable),
      { wrapper }
    );
    // No setting is specified, and the default is true
    await act(async () => {
      result.current.set(history.push, history.location, Environment.filterable[0].id);
    });

    await act(async () => {
      rerender();
    });

    await waitFor(() => {
      expect(result.current.useIsServerCompileEnabled()).toBe(true);
    });

    // trigger the useEffect to fetch once again with new settings set to false
    await act(async () => {
      result.current.set(history.push, history.location, Environment.filterable[1].id);
    });

    await act(async () => {
      rerender();
    });

    await waitFor(() => {
      expect(result.current.useIsServerCompileEnabled()).toBe(false);
    });
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
    const history = createMemoryHistory();
    const { result, rerender } = renderHook(
      () => EnvironmentHandlerImpl(() => history.location, routeManager, Environment.filterable),
      { wrapper }
    );

    await act(async () => {
      result.current.set(history.push, history.location, Environment.filterable[0].id);
    });

    await act(async () => {
      rerender();
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

    const history = createMemoryHistory();

    const { result, rerender } = renderHook(
      () => EnvironmentHandlerImpl(() => history.location, routeManager, Environment.filterable),
      { wrapper }
    );

    await act(async () => {
      result.current.set(history.push, history.location, Environment.filterable[0].id);
    });

    await act(async () => {
      rerender();
    });

    await waitFor(() => {
      expect(result.current.useIsServerCompileEnabled()).toBe(false);
    });
    expect(consoleError).not.toHaveBeenCalled();
  });
});
