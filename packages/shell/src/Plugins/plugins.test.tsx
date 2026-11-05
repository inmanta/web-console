import { act, screen } from "@testing-library/react";
import { graphql, http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { FeatureModule, PluginModule } from "@inmanta/web-console-core";
import { getSharedInstances } from "@inmanta/web-console-core/Dependency";
import { EnvironmentPreviewResponse } from "@inmanta/web-console-core/Queries/Slices/Environment";
import { ServerStatus, stubRoute } from "@inmanta/web-console-test-utils";
import { AppPlugin, createApp } from "..";

// Once the whole app has rendered, which can take over the default 1 s on slow CI runners.
const appTimeout = { timeout: 5000 };

const page = (text: string) => () => Promise.resolve(() => <p>{text}</p>);

const appFeature: FeatureModule = {
  id: "app",
  version: APP_VERSION,
  routes: [{ route: stubRoute("Dashboard"), page: page("Dashboard page") }],
};

const pluginFeature = (version = APP_VERSION): FeatureModule => ({
  id: "test-plugin",
  version,
  routes: [{ route: stubRoute("Facts"), page: page("Plugin page") }],
});

const plugin = (overrides: Partial<AppPlugin> = {}, version?: string): AppPlugin => ({
  id: "test-plugin",
  load: vi.fn((): Promise<PluginModule> =>
    Promise.resolve({ feature: pluginFeature(version), sharedInstances: getSharedInstances() })
  ),
  ...overrides,
});

const server = setupServer(
  http.get("/api/v1/serverstatus", () => HttpResponse.json({ data: ServerStatus.withLsm })),
  graphql.link("/api/v2/graphql").operation(({ query }) =>
    query.includes("notifications")
      ? HttpResponse.json({
          data: { data: { notifications: { edges: [] } }, errors: [], extensions: {} },
        })
      : HttpResponse.json<{ data: EnvironmentPreviewResponse }>({
          data: {
            data: {
              environments: {
                edges: [
                  {
                    node: {
                      id: "1",
                      name: "Environment 1",
                      isCompiling: false,
                      isExpertMode: false,
                      halted: false,
                    },
                  },
                ],
              },
            },
            errors: [],
            extensions: {},
          },
        })
  )
);

/**
 * Starts the app with the plugin at the url of the plugin's page.
 */
const renderApp = async (plugins: AppPlugin[]) => {
  globalThis.history.pushState({}, "", "/console/facts?env=1");
  const container = document.createElement("div");
  document.body.appendChild(container);
  let unmount = () => {};

  await act(async () => {
    unmount = createApp({ features: [appFeature], plugins }).render(container);
  });

  return () => {
    act(() => unmount());
    container.remove();
  };
};

describe("plugins", () => {
  let cleanup = () => {};

  beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
  afterEach(() => cleanup());
  afterAll(() => server.close());

  test("GIVEN an enabled plugin WHEN the app opens the url of its page THEN the plugin's page renders", async () => {
    cleanup = await renderApp([plugin()]);

    expect(await screen.findByText("Plugin page", {}, appTimeout)).toBeVisible();
  });

  test("GIVEN a plugin that isn't enabled THEN it isn't fetched and its url is not found", async () => {
    const disabled = plugin({ isEnabled: () => false });

    cleanup = await renderApp([disabled]);

    expect(
      await screen.findByText("404: We couldn't find that page", {}, appTimeout)
    ).toBeVisible();
    expect(disabled.load).not.toHaveBeenCalled();
  });

  test("GIVEN a plugin that isn't installed THEN the app starts without it", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});

    cleanup = await renderApp([plugin({ load: () => Promise.reject(new Error("404")) })]);

    expect(
      await screen.findByText("404: We couldn't find that page", {}, appTimeout)
    ).toBeVisible();
  });

  test("GIVEN a plugin built for another version THEN it is left out with a version mismatch notice", async () => {
    cleanup = await renderApp([plugin({}, "0.0.1")]);

    expect(await screen.findByText("test-plugin version mismatch", {}, appTimeout)).toBeVisible();
    expect(
      screen.getByText(
        `The test-plugin plugin is version 0.0.1, but the web console is version ${APP_VERSION}, so the test-plugin isn't available. Install the test-plugin plugin of version ${APP_VERSION}.`
      )
    ).toBeVisible();
    expect(screen.getByText("404: We couldn't find that page")).toBeVisible();
  });
});
