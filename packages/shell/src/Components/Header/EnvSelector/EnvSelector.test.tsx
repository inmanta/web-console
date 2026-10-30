import React from "react";
import { useLocation } from "react-router";
import { UsersIcon } from "@patternfly/react-icons";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { FeatureModule } from "@inmanta/web-console-core";
import { AuthContextInterface, defaultAuthContext } from "@inmanta/web-console-core/Auth";
import { MockedDependencyProvider } from "@inmanta/web-console-test-utils";
import { TestMemoryRouter } from "@inmanta/web-console-test-utils/Utils/TestMemoryRouter";
import { EnvSelector } from "./EnvSelector";

/**
 * A feature that adds a link to the user menu, shown only for a database session, like user
 * management does.
 */
const linkingFeature: FeatureModule = {
  id: "linking",
  version: "1.0.0",
  routes: [],
  contributions: {
    "header.user.actions": [
      {
        id: "users-link",
        getLabel: () => "Users",
        icon: UsersIcon,
        getUrl: () => "/users",
        isVisible: (_orchestratorProvider, authHelper) => authHelper.isDatabaseSession(),
      },
    ],
  },
};

const databaseSession: AuthContextInterface = {
  ...defaultAuthContext,
  isDisabled: () => false,
  isDatabaseSession: () => true,
};

const Location: React.FC = () => {
  const { pathname, search } = useLocation();

  return <div data-testid="location">{pathname + search}</div>;
};

const setup = (features: FeatureModule[], authHelper: AuthContextInterface) =>
  render(
    <TestMemoryRouter initialEntries={["/?env=aaa"]}>
      <MockedDependencyProvider features={features} authHelper={authHelper}>
        <EnvSelector items={[]} onSelect={vi.fn()} isOpen setIsOpen={vi.fn()} toggleText="env" />
        <Location />
      </MockedDependencyProvider>
    </TestMemoryRouter>
  );

describe("EnvSelector", () => {
  it("shows the links the features add to the user menu, and opens their page", async () => {
    setup([linkingFeature], databaseSession);

    await userEvent.click(screen.getByRole("menuitem", { name: "Users" }));

    expect(screen.getByTestId("location")).toHaveTextContent(/^\/users$/);
  });

  it("leaves out a link that its isVisible hides for this login", () => {
    setup([linkingFeature], { ...databaseSession, isDatabaseSession: () => false });

    expect(screen.queryByRole("menuitem", { name: "Users" })).not.toBeInTheDocument();
  });

  it("shows no extra links without features that add them", () => {
    setup([], databaseSession);

    expect(screen.queryByRole("menuitem", { name: "Users" })).not.toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Logout" })).toBeInTheDocument();
  });
});
