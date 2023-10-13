import React from "react";
import { MemoryRouter } from "react-router";
import { Router } from "react-router-dom";
import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createMemoryHistory } from "history";
import { RemoteData } from "@/Core";
import { Environment, dependencies } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { EnvSelectorWithData as EnvironmentSelector } from "./EnvSelectorWithData";

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
    <MemoryRouter>
      <DependencyProvider dependencies={dependencies}>
        <EnvironmentSelector
          environments={RemoteData.success(Environment.filterable)}
          onSelectEnvironment={() => {
            return;
          }}
          selectedEnvironment={envA}
        />
      </DependencyProvider>
    </MemoryRouter>,
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
    <MemoryRouter>
      <DependencyProvider dependencies={dependencies}>
        <EnvironmentSelector
          environments={RemoteData.success(Environment.filterable)}
          onSelectEnvironment={(item) => {
            selectedEnv = item.environmentId;
          }}
          selectedEnvironment={envA}
        />
      </DependencyProvider>
    </MemoryRouter>,
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

  expect(screen.getByText(`${envB.name} (${envB.projectName})`)).toBeVisible();
  expect(selectedEnv).toEqual(envB.id);
});

test("GIVEN EnvironmentSelector and environments with identical names WHEN user clicks on an environment THEN the correct environment is selected", async () => {
  let selectedEnv;
  const envA = Environment.filterable[0];
  const envB = Environment.filterable[2];
  render(
    <MemoryRouter>
      <DependencyProvider dependencies={dependencies}>
        <EnvironmentSelector
          environments={RemoteData.success(Environment.filterable)}
          onSelectEnvironment={(item) => {
            selectedEnv = item.environmentId;
          }}
          selectedEnvironment={envA}
        />
      </DependencyProvider>
    </MemoryRouter>,
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
