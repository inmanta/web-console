import { act } from "react";
import { render, screen } from "@testing-library/react";
import { FeatureModule, PageLoader } from "@/Core";
import { PrimaryRouteManager } from "@/UI/Routing/PrimaryRouteManager";
import * as Agents from "@S/Agents/Core/Route";
import * as Facts from "@S/Facts/Core/Route";
import { PrimaryPageManager } from "./PrimaryPageManager";

const AgentsPage = () => <div>Agents page</div>;
const FactsPage = () => <div>Facts page</div>;

/**
 * Pages are cached per loader, so every test creates its own loaders.
 */
const setup = ({ preload, factsPage }: { preload?: boolean; factsPage?: PageLoader } = {}) => {
  const loadAgents = vi.fn(() => Promise.resolve(AgentsPage));
  const loadFacts = vi.fn(factsPage ?? (() => Promise.resolve(FactsPage)));
  const feature: FeatureModule = {
    id: "test",
    version: "1.0.0",
    preload,
    routes: [
      { route: Agents.route, page: loadAgents },
      { route: Facts.route, page: loadFacts },
    ],
  };
  const routes = PrimaryRouteManager("", [Agents.route, Facts.route]).getRoutes();

  return {
    loadAgents,
    loadFacts,
    createPageManager: () => PrimaryPageManager(routes, [feature]),
  };
};

describe("PrimaryPageManager", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test("GIVEN the registered routes WHEN getting the pages THEN each page lazily renders the page of its feature", async () => {
    const { createPageManager, loadAgents } = setup();
    const pages = createPageManager().getPages();

    expect(pages.map(({ kind, path }) => ({ kind, path }))).toEqual([
      { kind: "Agents", path: "/agents" },
      { kind: "Facts", path: "/facts" },
    ]);
    expect(loadAgents).not.toHaveBeenCalled();

    render(pages[0].element);

    expect(await screen.findByText("Agents page")).toBeVisible();
    expect(loadAgents).toHaveBeenCalledTimes(1);
  });

  test("GIVEN a registered route that no feature declares WHEN getting the pages THEN its element is null", () => {
    const routes = PrimaryRouteManager("", [Facts.route]).getRoutes();
    const pages = PrimaryPageManager(routes, []).getPages();

    expect(pages).toHaveLength(1);
    expect(pages[0].element).toBeNull();
  });

  test("GIVEN the page manager is rebuilt WHEN rendering the new page THEN the page is not remounted", async () => {
    const { createPageManager } = setup();
    const [first] = createPageManager().getPages();
    const [second] = createPageManager().getPages();

    const { rerender } = render(first.element);
    const page = await screen.findByText("Agents page");

    rerender(second.element);

    expect(screen.getByText("Agents page")).toBe(page);
  });

  test("GIVEN a page that loads slowly WHEN opening it THEN the loading view only shows after a delay", async () => {
    vi.useFakeTimers();
    const { createPageManager } = setup({ factsPage: () => new Promise(() => {}) });
    const [, facts] = createPageManager().getPages();

    render(facts.element);

    expect(screen.queryByLabelText("LoadingPage")).not.toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByLabelText("LoadingPage")).toBeInTheDocument();
  });

  test("GIVEN the pages are preloaded WHEN opening a page THEN it renders right away", async () => {
    const { createPageManager, loadAgents, loadFacts } = setup();
    const pageManager = createPageManager();

    pageManager.preloadPages();

    await vi.waitFor(() => {
      expect(loadAgents).toHaveBeenCalledTimes(1);
      expect(loadFacts).toHaveBeenCalledTimes(1);
    });
    await act(async () => {});

    render(pageManager.getPages()[1].element);

    expect(screen.getByText("Facts page")).toBeVisible();
    expect(loadFacts).toHaveBeenCalledTimes(1);
  });

  test("GIVEN a feature that is not preloaded WHEN preloading the pages THEN its pages are not fetched", async () => {
    vi.useFakeTimers();
    const { createPageManager, loadAgents, loadFacts } = setup({ preload: false });

    createPageManager().preloadPages();

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(loadAgents).not.toHaveBeenCalled();
    expect(loadFacts).not.toHaveBeenCalled();
  });

  test("GIVEN preloading is stopped WHEN the browser is idle THEN no pages are fetched", async () => {
    vi.useFakeTimers();
    const { createPageManager, loadAgents, loadFacts } = setup();

    const stop = createPageManager().preloadPages();

    stop();

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(loadAgents).not.toHaveBeenCalled();
    expect(loadFacts).not.toHaveBeenCalled();
  });
});
