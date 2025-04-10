import React from "react";
import { MemoryRouter, useLocation } from "react-router";
import { Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { createMemoryHistory } from "history";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { FlatEnvironment, RemoteData } from "@/Core";
import { AuthProvider, getStoreInstance, KeycloakAuthConfig, LocalConfig } from "@/Data";
import { AuthTestWrapper, Environment, dependencies } from "@/Test";
import { DependencyProvider, EnvironmentHandlerImpl } from "@/UI/Dependency";
import ErrorBoundary from "@/UI/Utils/ErrorBoundary";
import { EnvSelectorWithData as EnvironmentSelector } from "./EnvSelectorWithData";
import { EnvironmentSelectorItem } from "./EnvSelectorWrapper";

const setup = (
  onSelectEnvironment: (item: EnvironmentSelectorItem) => void = () => {},
  config: KeycloakAuthConfig | LocalConfig | undefined = undefined,
  environments: FlatEnvironment[] = Environment.filterable
) => {
  const queryClient = new QueryClient();
  const environmentHandler = EnvironmentHandlerImpl(useLocation, dependencies.routeManager);
  const store = getStoreInstance();

  store.dispatch.environment.setEnvironments(RemoteData.success(environments));

  store.dispatch.environment.setEnvironmentDetailsById({
    id: "123",
    value: RemoteData.success(Environment.filterable[0]),
  });

  return (
    <ErrorBoundary>
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/",
            search: "?env=123",
          },
        ]}
      >
        <QueryClientProvider client={queryClient}>
          <DependencyProvider dependencies={{ ...dependencies, environmentHandler }}>
            <StoreProvider store={store}>
              <AuthProvider config={config}>
                <AuthTestWrapper dependencies={dependencies}>
                  <EnvironmentSelector
                    environments={RemoteData.success(environments)}
                    onSelectEnvironment={onSelectEnvironment}
                    selectedEnvironment={Environment.filterable[0]}
                  />
                </AuthTestWrapper>
              </AuthProvider>
            </StoreProvider>
          </DependencyProvider>
        </QueryClientProvider>
      </MemoryRouter>
    </ErrorBoundary>
  );
};

test("GIVEN EnvironmentSelector WHEN there are no environments THEN redirects", async () => {
  const history = createMemoryHistory();

  render(
    <Router location={history.location} navigator={history}>
      <DependencyProvider dependencies={dependencies}>
        <EnvironmentSelector
          environments={RemoteData.success([])}
          onSelectEnvironment={() => {
            return;
          }}
          selectedEnvironment={undefined}
        />
      </DependencyProvider>
    </Router>
  );
  expect(screen.getByText("Select an environment")).toBeVisible();
  expect(history.location.pathname).toEqual("/");
});

test("GIVEN EnvironmentSelector and a project WHEN user clicks on toggle THEN list of projects is shown", async () => {
  const envA = Environment.filterable[0];
  const envB = Environment.filterable[2];

  render(setup());

  const toggle = screen.getByText(`${envA.name} (${envA.projectName})`);

  await userEvent.click(toggle);

  const listItem = screen.getAllByText(`${envB.name} (${envB.projectName})`)[0];

  expect(listItem).toBeVisible();
});

test("GIVEN EnvironmentSelector and populated store WHEN user clicks on an item THEN selected environment is changed", async () => {
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

test("GIVEN EnvironmentSelector WHEN jwt auth is enabled will display fetched username on load", async () => {
  const onSelectEnv = () => {};
  const server = setupServer(
    http.get("/api/v2/current_user", async () => {
      return HttpResponse.json({
        data: {
          username: "test_user",
        },
      });
    })
  );

  server.listen();
  render(setup(onSelectEnv, { method: "jwt" }));

  await waitFor(() => {
    expect(screen.getByText("test_user")).toBeVisible();
  });
  expect(screen.getByText("test-env1 (default)")).toBeVisible();

  server.close();
});

test("GIVEN EnvironmentSelector WHEN jwt auth is enabled and current_user request returns 404 we should display Selector as is by default", async () => {
  const onSelectEnv = () => {};
  const server = setupServer(
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

  server.listen();
  render(setup(onSelectEnv, { method: "jwt" }));

  await waitFor(() => {
    expect(screen.queryByText("test_user")).not.toBeInTheDocument();
  });
  expect(screen.getByText("test-env1 (default)")).toBeVisible();

  server.close();
});
