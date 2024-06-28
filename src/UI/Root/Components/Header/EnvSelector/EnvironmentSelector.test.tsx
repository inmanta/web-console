import React, { act } from "react";
import { MemoryRouter } from "react-router";
import { Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createMemoryHistory } from "history";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { FlatEnvironment, RemoteData } from "@/Core";
import { AuthProvider, KeycloakAuthConfig, LocalConfig } from "@/Data";
import { AuthTestWrapper, Environment, dependencies } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import ErrorBoundary from "@/UI/Utils/ErrorBoundary";
import { EnvSelectorWithData as EnvironmentSelector } from "./EnvSelectorWithData";
import { EnvironmentSelectorItem } from "./EnvSelectorWrapper";

const setup = (
  environments: FlatEnvironment[],
  selectedEnv: FlatEnvironment | undefined,
  callback: (item: EnvironmentSelectorItem) => void,
  config: KeycloakAuthConfig | LocalConfig | undefined,
) => {
  const queryClient = new QueryClient();
  return (
    <ErrorBoundary>
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider config={config}>
            <AuthTestWrapper dependencies={dependencies}>
              <EnvironmentSelector
                environments={RemoteData.success(environments)}
                onSelectEnvironment={callback}
                selectedEnvironment={selectedEnv}
              />
            </AuthTestWrapper>
          </AuthProvider>
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
    </Router>,
  );
  expect(screen.getByText(`Select an environment`)).toBeVisible();
  expect(history.location.pathname).toEqual("/");
});

test("GIVEN EnvironmentSelector and a project WHEN user clicks on toggle THEN list of projects is shown", async () => {
  const envA = Environment.filterable[0];
  const envB = Environment.filterable[2];
  render(
    setup(
      Environment.filterable,
      envA,
      () => {
        return;
      },
      undefined,
    ),
  );

  const toggle = screen.getByText(`${envA.name} (${envA.projectName})`);
  await act(async () => {
    await userEvent.click(toggle);
  });
  const listItem = screen.getAllByText(`${envB.name} (${envB.projectName})`)[0];

  expect(listItem).toBeVisible();
});

test("GIVEN EnvironmentSelector and populated store WHEN user clicks on an item THEN selected environment is changed", async () => {
  let selectedEnv;
  const envA = Environment.filterable[0];
  const envB = Environment.filterable[2];
  render(
    setup(
      Environment.filterable,
      envA,
      (item) => {
        selectedEnv = item.environmentId;
      },
      undefined,
    ),
  );

  const toggle = screen.getByText(`${envA.name} (${envA.projectName})`);
  await act(async () => {
    await userEvent.click(toggle);
  });

  const listItem = screen.getAllByText(`${envB.name} (${envB.projectName})`)[0];

  expect(listItem).toBeVisible();

  await act(async () => {
    await userEvent.click(listItem);
  });

  expect(
    screen.queryByRole("button", {
      name: `${envB.name} (${envB.projectName})`,
    }),
  ).toBeVisible();
  expect(selectedEnv).toEqual(envB.id);
});

test("GIVEN EnvironmentSelector and environments with identical names WHEN user clicks on an environment THEN the correct environment is selected", async () => {
  let selectedEnv;
  const envA = Environment.filterable[0];
  const envB = Environment.filterable[2];
  render(
    setup(
      Environment.filterable,
      envA,
      (item) => {
        selectedEnv = item.environmentId;
      },
      undefined,
    ),
  );
  const toggle = screen.getByRole("button", {
    name: `${envA.name} (${envA.projectName})`,
  });
  await act(async () => {
    await userEvent.click(toggle);
  });

  const menuItems = screen.getAllByRole("menuitem");

  await act(async () => {
    await userEvent.click(menuItems[2]);
  });

  expect(
    screen.getByRole("button", {
      name: `${envB.name} (${envB.projectName})`,
    }),
  );

  expect(selectedEnv).toEqual(envB.id);
});

test("GIVEN EnvironmentSelector WHEN jwt auth is enabled will display fetched username on load", async () => {
  const server = setupServer(
    http.get("/api/v2/current_user", async () => {
      return HttpResponse.json({
        data: {
          username: "test_user",
        },
      });
    }),
  );
  server.listen();
  render(
    setup(
      [],
      undefined,
      () => {
        return;
      },
      { method: "jwt" },
    ),
  );

  await waitFor(() => {
    expect(screen.getByText("test_user")).toBeVisible();
  });
  server.close();
});

test("GIVEN EnvironmentSelector WHEN jwt auth is enabled and current_user request returns 404 we should display Selector as is by default", async () => {
  const server = setupServer(
    http.get("/api/v2/current_user", async () => {
      return HttpResponse.json(
        {
          message:
            "Request or referenced resource does not exist: No current user found, probably an API token is used.",
        },
        { status: 404 },
      );
    }),
  );
  server.listen();
  render(
    setup(
      [],
      undefined,
      () => {
        return;
      },
      { method: "jwt" },
    ),
  );

  await waitFor(() => {
    expect(screen.queryByText("test_user")).not.toBeInTheDocument();
  });
  expect(screen.queryByText("Select an environment")).toBeVisible();

  server.close();
});
