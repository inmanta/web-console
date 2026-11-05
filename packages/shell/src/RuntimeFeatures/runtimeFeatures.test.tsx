import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { graphql, http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { FeatureModule, RuntimeFeatureEntry, words } from "@inmanta/web-console-core";
import { getSingletons } from "@inmanta/web-console-core/Dependency";
import { EnvironmentPreviewResponse } from "@inmanta/web-console-core/Queries/Slices/Environment";
import { ServerStatus, stubRoute } from "@inmanta/web-console-test-utils";
import { createApp, RuntimeFeature } from "..";

// Once the whole app has rendered, which can take over the default 1 s on slow CI runners.
const appTimeout = { timeout: 5000 };

const page = (text: string) => () => Promise.resolve(() => <p>{text}</p>);

// The label of the runtime feature's page comes from its own messages, which are registered
// when it loads.
const labelKey = "test.runtimeFeature.label";
const label = () => (words as unknown as (key: string) => string)(labelKey);

const appFeature: FeatureModule = {
  id: "app",
  version: APP_VERSION,
  routes: [{ route: stubRoute("Dashboard"), page: page("Dashboard page") }],
};

const loadedFeature = (version = APP_VERSION): FeatureModule => ({
  id: "test-feature",
  version,
  messages: { [labelKey]: "Runtime page" },
  routes: [{ route: stubRoute("Agents", { label }), page: page("Runtime page content") }],
  navigation: [{ kind: "Agents", group: "resourceManager" }],
});

const runtimeFeature = (overrides: Partial<RuntimeFeature> = {}, version?: string) => ({
  id: "test-feature",
  load: vi.fn((): Promise<RuntimeFeatureEntry> =>
    Promise.resolve({ feature: loadedFeature(version), singletons: getSingletons() })
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
 * Starts the app with the given runtime features at the given url.
 */
const renderApp = async (runtimeFeatures: RuntimeFeature[], url = "/console/agents?env=1") => {
  globalThis.history.pushState({}, "", url);
  const container = document.createElement("div");
  document.body.appendChild(container);
  let unmount = () => {};

  await act(async () => {
    unmount = createApp({ features: [appFeature], runtimeFeatures }).render(container);
  });

  return () => {
    act(() => unmount());
    container.remove();
  };
};

describe("runtime features", () => {
  let cleanup = () => {};

  beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
  afterEach(() => cleanup());
  afterAll(() => server.close());

  test("GIVEN an enabled runtime feature WHEN the app opens the url of its page THEN the page renders with its sidebar entry and breadcrumb", async () => {
    cleanup = await renderApp([runtimeFeature()]);

    expect(await screen.findByText("Runtime page content", {}, appTimeout)).toBeVisible();
    expect(
      within(screen.getByLabelText("PageSidebar")).getByText("Runtime page").closest("a")
    ).toHaveAttribute("href", "/console/agents?env=1");
    expect(
      within(screen.getByRole("navigation", { name: "Breadcrumb" })).getByText("Runtime page")
    ).toBeVisible();
  });

  test("GIVEN a runtime feature WHEN navigating from a bundled page to its page THEN the page frame stays mounted", async () => {
    cleanup = await renderApp([runtimeFeature()], "/console/dashboard?env=1");

    expect(await screen.findByText("Dashboard page", {}, appTimeout)).toBeVisible();
    const sidebar = screen.getByLabelText("PageSidebar");

    await userEvent.click(within(sidebar).getByText("Runtime page"));

    expect(await screen.findByText("Runtime page content", {}, appTimeout)).toBeVisible();
    expect(screen.getByLabelText("PageSidebar")).toBe(sidebar);
  });

  test("GIVEN a runtime feature that isn't enabled THEN it isn't fetched and its url is not found", async () => {
    const disabled = runtimeFeature({ isEnabled: () => false });

    cleanup = await renderApp([disabled]);

    expect(
      await screen.findByText("404: We couldn't find that page", {}, appTimeout)
    ).toBeVisible();
    expect(disabled.load).not.toHaveBeenCalled();
  });

  test("GIVEN a runtime feature that isn't installed THEN the app starts without it", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});

    cleanup = await renderApp([runtimeFeature({ load: () => Promise.reject(new Error("404")) })]);

    expect(
      await screen.findByText("404: We couldn't find that page", {}, appTimeout)
    ).toBeVisible();
  });

  test("GIVEN a runtime feature built for another version THEN it is left out with a version mismatch notice", async () => {
    cleanup = await renderApp([runtimeFeature({}, "0.0.1")]);

    expect(await screen.findByText("test-feature version mismatch", {}, appTimeout)).toBeVisible();
    expect(
      screen.getByText(
        `The test-feature is version 0.0.1, but the web console is version ${APP_VERSION}, so the test-feature isn't available. Install the test-feature of version ${APP_VERSION}.`
      )
    ).toBeVisible();
    expect(screen.getByText("404: We couldn't find that page")).toBeVisible();
  });

  test("GIVEN a runtime feature with its own singletons THEN the app shows the error in development", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const ownCopy = runtimeFeature({
      load: () =>
        Promise.resolve({
          feature: loadedFeature(),
          singletons: { ...getSingletons(), react: {} },
        }),
    });

    cleanup = await renderApp([ownCopy]);

    expect(
      await screen.findByText(
        "The test-feature feature has its own copy of react instead of the app's. Share these modules with its build.",
        { exact: false },
        appTimeout
      )
    ).toBeVisible();
  });
});
