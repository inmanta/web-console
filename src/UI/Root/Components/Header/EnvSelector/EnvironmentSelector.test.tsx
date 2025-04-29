import React from "react";
import { Router } from "react-router";
import { createMemoryHistory } from "@remix-run/router";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { FlatEnvironment } from "@/Core";
import { AuthProvider, getStoreInstance, KeycloakAuthConfig, LocalConfig } from "@/Data";
import { useGetEnvironments } from "@/Data/Managers/V2/Environment";
import { useGetProjects } from "@/Data/Managers/V2/Project/GetProjects";
import { AuthTestWrapper, Environment, MockedDependencyProvider, Project } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import ErrorBoundary from "@/UI/Utils/ErrorBoundary";
import { EnvSelectorWithData as EnvironmentSelector } from "./EnvSelectorWithData";
import { EnvironmentSelectorItem } from "./EnvSelectorWrapper";
const EnvSelectorWrapper = ({
  onSelectEnvironment,
  selectedEnvironment,
}: {
  onSelectEnvironment: (item: EnvironmentSelectorItem) => void;
  selectedEnvironment?: FlatEnvironment;
}) => {
  const environments = useGetEnvironments().useOneTime(true);
  const projects = useGetProjects().useOneTime();

  return (
    <EnvironmentSelector
      environments={environments}
      projects={projects}
      onSelectEnvironment={onSelectEnvironment}
      selectedEnvironment={selectedEnvironment}
    />
  );
};

const setup = (
  onSelectEnvironment: (item: EnvironmentSelectorItem) => void = () => {},
  config: KeycloakAuthConfig | LocalConfig | undefined = undefined
) => {
  const store = getStoreInstance();

  return (
    <ErrorBoundary>
      <TestMemoryRouter initialEntries={["/?env=123"]}>
        <QueryClientProvider client={testClient}>
          <StoreProvider store={store}>
            <AuthProvider config={config}>
              <AuthTestWrapper>
                <EnvSelectorWrapper
                  onSelectEnvironment={onSelectEnvironment}
                  selectedEnvironment={Environment.filterable[0]}
                />
              </AuthTestWrapper>
            </AuthProvider>
          </StoreProvider>
        </QueryClientProvider>
      </TestMemoryRouter>
    </ErrorBoundary>
  );
};

describe("EnvironmentSelector", () => {
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

  test("GIVEN EnvironmentSelector WHEN there are no environments THEN redirects", async () => {
    server.use(
      http.get("/api/v2/environment", async () => {
        return HttpResponse.json({
          data: [],
        });
      }),
      http.get("/api/v2/project", async () => {
        return HttpResponse.json({
          data: [],
        });
      })
    );

    const history = createMemoryHistory();

    render(
      <Router location={history.location} navigator={history}>
        <QueryClientProvider client={testClient}>
          <MockedDependencyProvider>
            <EnvSelectorWrapper
              onSelectEnvironment={() => {
                return;
              }}
            />
          </MockedDependencyProvider>
        </QueryClientProvider>
      </Router>
    );

    expect(await screen.findByText("Select an environment")).toBeVisible();
    expect(history.location.pathname).toEqual("/");
  });

  test("GIVEN EnvironmentSelector and a project WHEN user clicks on toggle THEN list of projects is shown", async () => {
    server.use(
      http.get("/api/v2/environment", async () => {
        return HttpResponse.json({
          data: Environment.filterable,
        });
      }),
      http.get("/api/v2/project", async () => {
        return HttpResponse.json({
          data: Project.filterable,
        });
      })
    );

    const envA = Environment.filterable[0];
    const envB = Environment.filterable[2];

    render(setup());

    const toggle = screen.getByText(`${envA.name} (${envA.projectName})`);

    await userEvent.click(toggle);

    const listItem = screen.getAllByText(`${envB.name} (${envB.projectName})`)[0];

    expect(listItem).toBeVisible();
  });

  test("GIVEN EnvironmentSelector and populated store WHEN user clicks on an item THEN selected environment is changed", async () => {
    server.use(
      http.get("/api/v2/environment", async () => {
        return HttpResponse.json({
          data: Environment.filterable,
        });
      }),
      http.get("/api/v2/project", async () => {
        return HttpResponse.json({
          data: Project.filterable,
        });
      })
    );

    let selectedEnv;
    const onSelectEnv = (item) => {
      selectedEnv = item.environmentId;
    };
    const envA = Environment.filterable[0];
    const envB = Environment.filterable[2];

    render(setup(onSelectEnv));

    const toggle = screen.getByText(`${envA.name} (${envA.projectName})`);

    await userEvent.click(toggle);

    const listItem = screen.getAllByText(`${envB.name} (${envB.projectName})`)[0];

    expect(listItem).toBeVisible();

    await userEvent.click(listItem);

    expect(
      screen.queryByRole("button", {
        name: `${envB.name} (${envB.projectName})`,
      })
    ).toBeVisible();
    expect(selectedEnv).toEqual(envB.id);
  });

  test("GIVEN EnvironmentSelector and environments with identical names WHEN user clicks on an environment THEN the correct environment is selected", async () => {
    server.use(
      http.get("/api/v2/environment", async () => {
        return HttpResponse.json({
          data: Environment.filterable,
        });
      }),
      http.get("/api/v2/project", async () => {
        return HttpResponse.json({
          data: Project.filterable,
        });
      })
    );
    let selectedEnv;
    const onSelectEnv = (item) => {
      selectedEnv = item.environmentId;
    };
    const envA = Environment.filterable[0];
    const envB = Environment.filterable[2];

    render(setup(onSelectEnv));
    const toggle = screen.getByRole("button", {
      name: `${envA.name} (${envA.projectName})`,
    });

    await userEvent.click(toggle);

    const menuItems = screen.getAllByRole("menuitem");

    await userEvent.click(menuItems[2]);

    expect(
      screen.getByRole("button", {
        name: `${envB.name} (${envB.projectName})`,
      })
    );

    expect(selectedEnv).toEqual(envB.id);
  });

  test("GIVEN EnvironmentSelector WHEN jwt auth is enabled and current_user request returns 404 we should display Selector as is by default", async () => {
    const onSelectEnv = () => {};
    server.use(
      http.get("/api/v2/environment", async () => {
        return HttpResponse.json({
          data: Environment.filterable,
        });
      }),
      http.get("/api/v2/project", async () => {
        return HttpResponse.json({
          data: Project.filterable,
        });
      }),
      http.get("/api/v2/current_user", async () => {
        return HttpResponse.json(
          {
            message:
              "Request or referenced resource does not exist: No current user found, probably an API token is used.",
          },
          { status: 404 }
        );
      })
    );

    render(setup(onSelectEnv, { method: "jwt" }));

    await waitFor(() => {
      expect(screen.queryByText("test_user")).not.toBeInTheDocument();
    });
    expect(screen.getByText("test-env1 (default)")).toBeVisible();
  });

  test("GIVEN EnvironmentSelector WHEN jwt auth is enabled will display fetched username on load", async () => {
    const onSelectEnv = () => {};
    server.use(
      http.get("/api/v2/environment", async () => {
        return HttpResponse.json({
          data: Environment.filterable,
        });
      }),
      http.get("/api/v2/project", async () => {
        return HttpResponse.json({
          data: Project.filterable,
        });
      }),
      http.get("/api/v2/current_user", async () => {
        return HttpResponse.json({
          data: {
            username: "test_user",
          },
        });
      })
    );

    render(setup(onSelectEnv, { method: "jwt" }));

    expect(await screen.findByText("test_user")).toBeVisible();
    expect(screen.getByText("test-env1 (default)")).toBeVisible();
  });
});
