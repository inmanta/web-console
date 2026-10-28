import { act } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { FeatureModule } from "@inmanta/web-console-core";
import { ShellOptions, ShellOptionsContext } from "@inmanta/web-console-shell/ShellOptions";
import { MockedDependencyProvider } from "@inmanta/web-console-test-utils";
import { stubRoute } from "@inmanta/web-console-test-utils/Inject/stubRoute";
import { TestMemoryRouter } from "@inmanta/web-console-test-utils/Utils/TestMemoryRouter";
import { testClient } from "@inmanta/web-console-test-utils/Utils/react-query-setup";
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
    <QueryClientProvider client={testClient}>
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
  afterEach(() => {
    testClient.clear();
  });

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

  // getGroups' tests cover what each sidebar option does; this one checks that they reach it.
  test("GIVEN the sidebar options of the app THEN it uses them, and an app link opens in a new tab", () => {
    render(
      setup({
        shell: {
          sidebar: {
            appLinks: [
              { group: "environment", label: "Documentation", href: "https://docs.inmanta.com" },
            ],
          },
        },
      })
    );

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
            appLinks: [
              { group: "environment", label: "Documentation", href: "https://docs.inmanta.com" },
            ],
          },
        },
      })
    );

    expect(screen.queryAllByRole("link", { name: "Sidebar-Navigation-Item" })).toHaveLength(0);
    // The feature entries are still shown, but locked: a disabled link that goes nowhere.
    const dashboard = screen.getByText("Dashboard").closest("a");

    expect(dashboard).toBeVisible();
    expect(dashboard).toHaveAttribute("disabled");
    expect(dashboard).not.toHaveAttribute("href");
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
