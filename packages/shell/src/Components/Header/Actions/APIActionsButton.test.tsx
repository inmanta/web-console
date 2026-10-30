import React from "react";
import { useLocation } from "react-router";
import { CodeIcon } from "@patternfly/react-icons";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { FeatureModule, words } from "@inmanta/web-console-core";
import { MockedDependencyProvider } from "@inmanta/web-console-test-utils";
import { TestMemoryRouter } from "@inmanta/web-console-test-utils/Utils/TestMemoryRouter";
import { APIActionsButton } from "./APIActionsButton";

/**
 * A feature that adds a link to the Developer Tools menu, like GraphiQL does.
 */
const toolFeature: FeatureModule = {
  id: "tool",
  version: "1.0.0",
  routes: [],
  contributions: {
    "header.developerTools.actions": [
      { id: "tool-link", getLabel: () => "Query tool", icon: CodeIcon, getUrl: () => "/tool" },
    ],
  },
};

const Location: React.FC = () => {
  const { pathname, search } = useLocation();

  return <div data-testid="location">{pathname + search}</div>;
};

const setup = (features: FeatureModule[]) =>
  render(
    <TestMemoryRouter initialEntries={["/resources?env=aaa&state.Resources.page=2"]}>
      <MockedDependencyProvider features={features}>
        <APIActionsButton />
        <Location />
      </MockedDependencyProvider>
    </TestMemoryRouter>
  );

const openMenu = () =>
  userEvent.click(screen.getByRole("button", { name: words("dashboard.apiActions.tooltip") }));

describe("APIActionsButton", () => {
  it("shows the links the features add, and opens them with only the environment kept", async () => {
    setup([toolFeature]);

    await openMenu();

    const items = screen.getAllByRole("menuitem").map((item) => item.textContent);

    expect(items).toEqual(["Query tool", words("dashboard.apiActions.restApi")]);

    await userEvent.click(screen.getByRole("menuitem", { name: "Query tool" }));

    expect(screen.getByTestId("location")).toHaveTextContent(/^\/tool\?env=aaa$/);
  });

  it("only shows the REST API link without features that add links", async () => {
    setup([]);

    await openMenu();

    expect(screen.getAllByRole("menuitem").map((item) => item.textContent)).toEqual([
      words("dashboard.apiActions.restApi"),
    ]);
  });
});
