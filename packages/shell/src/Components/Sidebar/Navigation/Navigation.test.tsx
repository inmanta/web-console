import { act } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { FeatureModule, words } from "@inmanta/web-console-core";
import { ShellOptions, ShellOptionsContext } from "@inmanta/web-console-shell/ShellOptions";
import { MockedDependencyProvider } from "@inmanta/web-console-test-utils";
import { stubRoute } from "@inmanta/web-console-test-utils/Inject/stubRoute";
import { TestMemoryRouter } from "@inmanta/web-console-test-utils/Utils/TestMemoryRouter";
import { Navigation } from "./Navigation";

const page = () => Promise.resolve(() => null);

const feature: FeatureModule = {
  id: "test",
  version: "1.0.0",
  routes: [
    { route: stubRoute("Dashboard", { environmentRole: "Required" }), page },
    { route: stubRoute("Resources", { environmentRole: "Required" }), page },
    { route: stubRoute("CompileReports", { environmentRole: "Required" }), page },
  ],
  navigation: [
    { kind: "Dashboard", group: "environment" },
    { kind: "Resources", group: "resourceManager" },
    { kind: "CompileReports", group: "orchestrationEngine", statusIndication: true },
  ],
};

function setup({
  shell = {},
  withEnvironment = true,
  isCompiling = false,
  initialEntries = ["/"],
}: {
  shell?: ShellOptions;
  withEnvironment?: boolean;
  isCompiling?: boolean;
  initialEntries?: string[];
} = {}) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <TestMemoryRouter initialEntries={initialEntries}>
        <MockedDependencyProvider features={[feature]} isCompiling={isCompiling}>
          <ShellOptionsContext.Provider value={shell}>
            <Navigation environment={withEnvironment ? "env" : undefined} />
          </ShellOptionsContext.Provider>
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );
}

describe("Navigation", () => {
  test("GIVEN Navigation THEN it is accessible", async () => {
    const { container } = render(setup());

    await act(async () => {
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  test("GIVEN the features' entries THEN it shows a group per filled group, in the default order", () => {
    render(setup());

    const navigation = screen.getByRole("navigation", { name: "Global" });

    expect(within(navigation).getAllByRole("region")).toHaveLength(3);
    expect(
      within(navigation)
        .getAllByRole("link", { name: "Sidebar-Navigation-Item" })
        .map((link) => link.textContent)
    ).toEqual(["Dashboard", "CompileReports", "Resources"]);
  });

  test("GIVEN the sidebar options of the app THEN it orders, hides and adds entries", () => {
    render(
      setup({
        shell: {
          sidebar: {
            order: ["resourceManager"],
            hide: ["CompileReports"],
            links: [
              { group: "environment", label: "Documentation", href: "https://docs.inmanta.com" },
            ],
          },
        },
      })
    );

    const navigation = screen.getByRole("navigation", { name: "Global" });
    const [first, second] = within(navigation).getAllByRole("region");

    expect(within(first).getByText(words("navigation.resourceManager"))).toBeVisible();
    expect(within(second).getByText(words("navigation.environment"))).toBeVisible();
    expect(screen.queryByText("CompileReports")).not.toBeInTheDocument();

    const documentation = screen.getByRole("link", { name: "Sidebar-Navigation-Item-External" });

    expect(documentation).toHaveTextContent("Documentation");
    expect(documentation).toHaveAttribute("href", "https://docs.inmanta.com");
    expect(documentation).toHaveAttribute("target", "_blank");
  });

  test("GIVEN no environment THEN the feature links are locked but the app links are not", () => {
    render(
      setup({
        withEnvironment: false,
        shell: {
          sidebar: {
            links: [
              { group: "environment", label: "Documentation", href: "https://docs.inmanta.com" },
            ],
          },
        },
      })
    );

    expect(screen.queryAllByRole("link", { name: "Sidebar-Navigation-Item" })).toHaveLength(0);
    expect(screen.getByRole("link", { name: "Sidebar-Navigation-Item-External" })).toBeVisible();
  });

  test("GIVEN the current page THEN its link is highlighted", () => {
    render(setup({ initialEntries: ["/resources"] }));

    expect(
      screen.getByRole("link", { name: "Sidebar-Navigation-Item", current: "page" })
    ).toHaveTextContent("Resources");
  });

  test("GIVEN a compile is running THEN the entry with a status indication shows it", async () => {
    render(setup({ isCompiling: true }));

    expect(await screen.findByLabelText("CompileReportsIndication")).toBeVisible();
  });
});
