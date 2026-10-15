import { render, screen } from "@testing-library/react";
import { FeatureModule } from "@/Core";
import { PrimaryRouteManager } from "@/UI/Routing/PrimaryRouteManager";
import * as Agents from "@S/Agents/Core/Route";
import * as Facts from "@S/Facts/Core/Route";
import { PrimaryPageManager } from "./PrimaryPageManager";

const AgentsPage = () => <div>Agents page</div>;

const feature: FeatureModule = {
  id: "test",
  version: "1.0.0",
  routes: [{ route: Agents.route, page: () => Promise.resolve(AgentsPage) }],
};

describe("PrimaryPageManager", () => {
  test("GIVEN the registered routes WHEN getting the pages THEN each page lazily renders the page of its feature", async () => {
    const routeManager = PrimaryRouteManager("", [Agents.route]);
    const pages = new PrimaryPageManager(routeManager.getRoutes(), [feature]).getPages();

    expect(pages.map(({ kind, path }) => ({ kind, path }))).toEqual([
      { kind: "Agents", path: "/agents" },
    ]);

    render(pages[0].element);

    expect(await screen.findByText("Agents page")).toBeVisible();
  });

  test("GIVEN a registered route that no feature declares WHEN getting the pages THEN its element is null", () => {
    const routeManager = PrimaryRouteManager("", [Facts.route]);
    const pages = new PrimaryPageManager(routeManager.getRoutes(), [feature]).getPages();

    expect(pages).toHaveLength(1);
    expect(pages[0].element).toBeNull();
  });

  test("GIVEN the page manager is rebuilt WHEN rendering the new page THEN the page is not remounted", async () => {
    const routes = PrimaryRouteManager("", [Agents.route]).getRoutes();
    const [first] = new PrimaryPageManager(routes, [feature]).getPages();
    const [second] = new PrimaryPageManager(routes, [feature]).getPages();

    const { rerender } = render(first.element);
    const page = await screen.findByText("Agents page");

    rerender(second.element);

    expect(screen.getByText("Agents page")).toBe(page);
  });
});
