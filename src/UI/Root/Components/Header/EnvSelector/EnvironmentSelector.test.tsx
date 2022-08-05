import React from "react";
import { MemoryRouter } from "react-router";
import { Router } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    </Router>
  );
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
    </MemoryRouter>
  );

  const toggle = screen.getByRole("button", {
    name: `Selected Project: ${envA.name} (${envA.projectName})`,
  });
  await userEvent.click(toggle);
  const listItem = screen.queryByRole("menuitem", {
    name: `${envB.name} (${envB.projectName})`,
  });

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
    </MemoryRouter>
  );

  const toggle = screen.getByRole("button", {
    name: `Selected Project: ${envA.name} (${envA.projectName})`,
  });
  await userEvent.click(toggle);

  const listItem = screen.getByRole("menuitem", {
    name: `${envB.name} (${envB.projectName})`,
  });

  expect(listItem).toBeVisible();

  await userEvent.click(listItem);

  expect(
    screen.queryByRole("button", {
      name: `Selected Project: ${envB.name} (${envB.projectName})`,
    })
  ).toBeVisible();
  expect(selectedEnv).toEqual(envB.id);
});

test.each`
  inputValue    | numberOfMatchedItems
  ${"test"}     | ${2}
  ${"dev-env2"} | ${1}
`(
  "GIVEN EnvironmentSelector and populated store WHEN user types in '$inputValue' THEN shows $numberOfMatchedItems items",
  async ({ inputValue, numberOfMatchedItems }) => {
    const env = Environment.filterable[0];

    render(
      <MemoryRouter>
        <DependencyProvider dependencies={dependencies}>
          <EnvironmentSelector
            environments={RemoteData.success(Environment.filterable)}
            onSelectEnvironment={() => {
              return;
            }}
            selectedEnvironment={env}
          />
        </DependencyProvider>
      </MemoryRouter>
    );

    const toggle = screen.getByRole("button", {
      name: `Selected Project: ${env.name} (${env.projectName})`,
    });
    await userEvent.click(toggle);

    const menuItemsBefore = screen.getAllByRole("menuitem");
    expect(menuItemsBefore).toHaveLength(Environment.filterable.length);

    const input = screen.getByRole("searchbox", { name: "Filter Projects" });
    await userEvent.type(input, inputValue);

    const menuItemsAfter = screen.getAllByRole("menuitem");
    expect(menuItemsAfter).toHaveLength(numberOfMatchedItems);
  }
);

test("GIVEN EnvironmentSelector and populated store WHEN user types in non matching text THEN shows no items", async () => {
  const env = Environment.filterable[0];
  render(
    <MemoryRouter>
      <DependencyProvider dependencies={dependencies}>
        <EnvironmentSelector
          environments={RemoteData.success(Environment.filterable)}
          onSelectEnvironment={() => {
            return;
          }}
          selectedEnvironment={env}
        />
      </DependencyProvider>
    </MemoryRouter>
  );

  const toggle = screen.getByRole("button", {
    name: `Selected Project: ${env.name} (${env.projectName})`,
  });
  await userEvent.click(toggle);

  const menuItemsBefore = screen.getAllByRole("menuitem");
  expect(menuItemsBefore).toHaveLength(Environment.filterable.length);

  const input = screen.getByRole("searchbox", { name: "Filter Projects" });
  await userEvent.type(input, "non_existing_project_name");

  const menuItemsAfter = screen.queryByRole("menuitem");
  expect(menuItemsAfter).not.toBeInTheDocument();
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
    </MemoryRouter>
  );
  const toggle = screen.getByRole("button", {
    name: `Selected Project: ${envA.name} (${envA.projectName})`,
  });
  await userEvent.click(toggle);

  const menuItems = screen.getAllByRole("menuitem");
  await userEvent.click(menuItems[2]);

  expect(
    screen.getByRole("button", {
      name: `Selected Project: ${envB.name} (${envB.projectName})`,
    })
  );

  expect(selectedEnv).toEqual(envB.id);
});
