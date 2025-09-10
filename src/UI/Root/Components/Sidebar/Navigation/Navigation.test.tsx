import { act } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { MockedDependencyProvider, MockOrchestratorProvider } from "@/Test";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { words } from "@/UI/words";
import { Navigation } from "./Navigation";

function setup(initialEntries?: string[], isCompiling: boolean = false) {
  const queryClient = new QueryClient();

  const component = (
    <QueryClientProvider client={queryClient}>
      <TestMemoryRouter initialEntries={initialEntries}>
        <MockedDependencyProvider isCompiling={isCompiling}>
          <Navigation environment="env" />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return { component };
}

describe("Navigation", () => {
  afterAll(() => {
    vi.clearAllMocks();
  });

  test("GIVEN Navigation THEN it should be accessible", async () => {
    const { component } = setup();
    const { container } = render(component);

    await act(async () => {
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  test("GIVEN Navigation WHEN lsm enabled THEN shows all navigation items", () => {
    const { component } = setup();

    render(component);

    const navigation = screen.getByRole("navigation", { name: "Global" });

    expect(navigation).toBeVisible();
    expect(within(navigation).getAllByRole("region").length).toEqual(4);
    expect(
      within(navigation).getByRole("region", {
        name: words("navigation.environment"),
      })
    ).toBeVisible();

    expect(
      within(navigation).getByRole("region", {
        name: words("navigation.lifecycleServiceManager"),
      })
    ).toBeVisible();

    expect(
      within(navigation).getByRole("region", {
        name: words("navigation.orchestrationEngine"),
      })
    ).toBeVisible();

    expect(
      within(navigation).getByRole("region", {
        name: words("navigation.resourceManager"),
      })
    ).toBeVisible();
  });

  test("GIVEN Navigation WHEN no features enabled THEN no extra features are not shown", () => {
    vi.spyOn(MockOrchestratorProvider.prototype, "isLsmEnabled").mockReturnValue(false);
    vi.spyOn(MockOrchestratorProvider.prototype, "isOrderViewEnabled").mockReturnValue(false);
    vi.spyOn(MockOrchestratorProvider.prototype, "isResourceDiscoveryEnabled").mockReturnValue(
      false
    );

    const { component } = setup();

    render(component);

    const navigation = screen.getByRole("navigation", { name: "Global" });

    expect(navigation).toBeVisible();
    expect(within(navigation).getAllByRole("region").length).toEqual(3);

    const links = within(navigation).getAllByRole("link", {
      name: "Sidebar-Navigation-Item",
    });

    // no lsm
    expect(
      within(navigation).queryByRole("region", {
        name: words("navigation.lifecycleServiceManager"),
      })
    ).not.toBeInTheDocument();

    // no orderView
    expect(links.find((item) => item.textContent === "Orders")).toBeUndefined();

    // no resourceDiscovery
    expect(links.find((item) => item.textContent === "Discovered Resources")).toBeUndefined();
  });

  test("GIVEN Navigation WHEN all features are enabled THEN all extra features are shown", () => {
    vi.spyOn(MockOrchestratorProvider.prototype, "isLsmEnabled").mockReturnValue(true);
    vi.spyOn(MockOrchestratorProvider.prototype, "isOrderViewEnabled").mockReturnValue(true);
    vi.spyOn(MockOrchestratorProvider.prototype, "isResourceDiscoveryEnabled").mockReturnValue(
      true
    );

    const { component } = setup();

    render(component);

    const navigation = screen.getByRole("navigation", { name: "Global" });

    expect(navigation).toBeVisible();
    expect(within(navigation).getAllByRole("region").length).toEqual(4);

    const links = within(navigation).getAllByRole("link", {
      name: "Sidebar-Navigation-Item",
    });

    // lsm
    expect(
      within(navigation).getByRole("region", {
        name: words("navigation.lifecycleServiceManager"),
      })
    ).toBeInTheDocument();

    // has orderView
    expect(links.find((item) => item.textContent === "Orders")).toBeInTheDocument();

    // has resourceDiscovery
    expect(links.find((item) => item.textContent === "Discovered Resources")).toBeInTheDocument();
  });

  test("GIVEN Navigation WHEN on 'Service Catalog' THEN 'Service Catalog' is highlighted", () => {
    const { component } = setup(["/lsm/catalog"]);

    render(component);

    const navigation = screen.getByRole("navigation", { name: "Global" });
    const links = within(navigation).getAllByRole("link", {
      name: "Sidebar-Navigation-Item",
    });

    const link = links.find((item) => item.textContent === "Service Catalog");

    // Check for aria-current attribute which indicates active state
    expect(link).toHaveAttribute("aria-current", "page");
  });

  test("GIVEN Navigation WHEN Compilation Reports are not pending THEN 'Compile Reports' Indication does not exist", async () => {
    const { component } = setup(["/lsm/catalog"]);

    render(component);
    const Indication = screen.queryByLabelText("CompileReportsIndication");

    expect(Indication).toBeNull();
  });

  test("GIVEN Navigation WHEN Compilation Reports are pending THEN 'Compile Reports' Indication is visible", async () => {
    const { component } = setup(["/lsm/catalog"], true);

    render(component);
    const Indication = await screen.findByLabelText("CompileReportsIndication");

    expect(Indication).toBeVisible();
  });

  describe("Navigation isActive functionality", () => {
    test("GIVEN Navigation WHEN on exact route match THEN navigation item is active", () => {
      const { component } = setup(["/lsm/catalog"]);

      render(component);

      const navigation = screen.getByRole("navigation", { name: "Global" });
      const links = within(navigation).getAllByRole("link", {
        name: "Sidebar-Navigation-Item",
      });

      const serviceCatalogLink = links.find((item) => item.textContent === "Service Catalog");
      const navItem =
        serviceCatalogLink?.closest("[data-pf-v6-c-nav__item]") ||
        serviceCatalogLink?.parentElement;

      expect(navItem).toHaveClass("pf-m-current");
    });

    test("GIVEN Navigation WHEN on sub-route THEN parent navigation item is active", () => {
      const { component } = setup(["/lsm/catalog/details/123"]);

      render(component);

      const navigation = screen.getByRole("navigation", { name: "Global" });
      const links = within(navigation).getAllByRole("link", {
        name: "Sidebar-Navigation-Item",
      });

      const serviceCatalogLink = links.find((item) => item.textContent === "Service Catalog");
      const navItem =
        serviceCatalogLink?.closest("[data-pf-v6-c-nav__item]") ||
        serviceCatalogLink?.parentElement;

      expect(navItem).toHaveClass("pf-m-current");
    });

    test("GIVEN Navigation WHEN on different route THEN navigation items are not active", () => {
      const { component } = setup(["/different/route"]);

      render(component);

      const navigation = screen.getByRole("navigation", { name: "Global" });
      const links = within(navigation).getAllByRole("link", {
        name: "Sidebar-Navigation-Item",
      });

      const serviceCatalogLink = links.find((item) => item.textContent === "Service Catalog");
      const navItem =
        serviceCatalogLink?.closest("[data-pf-v6-c-nav__item]") ||
        serviceCatalogLink?.parentElement;

      expect(navItem).not.toHaveClass("pf-m-current");
    });

    test("GIVEN Navigation WHEN route has query parameters THEN navigation item is still active", () => {
      const { component } = setup(["/lsm/catalog?env=test&filter=active"]);

      render(component);

      const navigation = screen.getByRole("navigation", { name: "Global" });
      const links = within(navigation).getAllByRole("link", {
        name: "Sidebar-Navigation-Item",
      });

      const serviceCatalogLink = links.find((item) => item.textContent === "Service Catalog");
      const navItem =
        serviceCatalogLink?.closest("[data-pf-v6-c-nav__item]") ||
        serviceCatalogLink?.parentElement;

      expect(navItem).toHaveClass("pf-m-current");
    });

    test("GIVEN Navigation WHEN route has hash fragment THEN navigation item is still active", () => {
      const { component } = setup(["/lsm/catalog#section1"]);

      render(component);

      const navigation = screen.getByRole("navigation", { name: "Global" });
      const links = within(navigation).getAllByRole("link", {
        name: "Sidebar-Navigation-Item",
      });

      const serviceCatalogLink = links.find((item) => item.textContent === "Service Catalog");
      const navItem =
        serviceCatalogLink?.closest("[data-pf-v6-c-nav__item]") ||
        serviceCatalogLink?.parentElement;

      expect(navItem).toHaveClass("pf-m-current");
    });

    test("GIVEN Navigation WHEN on root path THEN no navigation items are active", () => {
      const { component } = setup(["/"]);

      render(component);

      const navigation = screen.getByRole("navigation", { name: "Global" });
      const navItems = within(navigation).queryAllByRole("button", { name: /pf-m-current/ });

      expect(navItems).toHaveLength(0);
    });

    test("GIVEN Navigation WHEN on Resources page THEN Resources navigation item is active", () => {
      const { component } = setup(["/resources"]);

      render(component);

      const navigation = screen.getByRole("navigation", { name: "Global" });
      const links = within(navigation).getAllByRole("link", {
        name: "Sidebar-Navigation-Item",
      });

      const resourcesLink = links.find((item) => item.textContent === "Resources");
      const navItem =
        resourcesLink?.closest("[data-pf-v6-c-nav__item]") || resourcesLink?.parentElement;

      expect(navItem).toHaveClass("pf-m-current");
    });

    test("GIVEN Navigation WHEN on Desired State page THEN Desired State navigation item is active", () => {
      const { component } = setup(["/desiredstate"]);

      render(component);

      const navigation = screen.getByRole("navigation", { name: "Global" });
      const links = within(navigation).getAllByRole("link", {
        name: "Sidebar-Navigation-Item",
      });

      const desiredStateLink = links.find((item) => item.textContent === "Desired State");
      const navItem =
        desiredStateLink?.closest("[data-pf-v6-c-nav__item]") || desiredStateLink?.parentElement;

      expect(navItem).toHaveClass("pf-m-current");
    });
  });
});
