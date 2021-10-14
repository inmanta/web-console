import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EnvSelectorWithData as EnvironmentSelector } from "./EnvSelectorWithData";
import { RemoteData } from "@/Core";
import { Project } from "@/Test";
import { MemoryRouter } from "react-router";

test("GIVEN EnvironmentSelector WHEN no environments THEN error view", async () => {
  render(
    <MemoryRouter>
      <EnvironmentSelector
        projects={RemoteData.success([])}
        onSelectEnvironment={() => {
          return;
        }}
        selectedProjectAndEnvironment={RemoteData.failed(
          "No environments were found"
        )}
      />
    </MemoryRouter>
  );

  expect(
    await screen.findByRole("generic", { name: "EnvSelector-Failed" })
  ).toBeInTheDocument();
});

test("GIVEN EnvironmentSelector and a project WHEN user clicks on toggle THEN list of projects is shown", () => {
  const [projectA, projectB] = Project.list;
  const [envA] = projectA.environments;
  const [envB] = projectB.environments;
  render(
    <MemoryRouter>
      <EnvironmentSelector
        projects={RemoteData.success(Project.list)}
        onSelectEnvironment={() => {
          return;
        }}
        selectedProjectAndEnvironment={RemoteData.success({
          environment: envA,
          project: projectA,
        })}
      />
    </MemoryRouter>
  );

  const toggle = screen.getByRole("button", {
    name: `Selected Project: ${envA.name} (${projectA.name})`,
  });
  userEvent.click(toggle);
  const listItem = screen.queryByRole("menuitem", {
    name: `${envB.name} (${projectB.name})`,
  });

  expect(listItem).toBeVisible();
});

test("GIVEN EnvironmentSelector and populated store WHEN user clicks on an item THEN selected environment is changed", () => {
  let selectedEnv;
  let selectedProject;
  const [projectA, projectB] = Project.list;
  const [envA] = projectA.environments;
  const [envB] = projectB.environments;
  render(
    <MemoryRouter>
      <EnvironmentSelector
        projects={RemoteData.success(Project.list)}
        onSelectEnvironment={(item) => {
          (selectedEnv = item.environmentId),
            (selectedProject = item.projectId);
        }}
        selectedProjectAndEnvironment={RemoteData.success({
          environment: envA,
          project: projectA,
        })}
      />
    </MemoryRouter>
  );

  const toggle = screen.getByRole("button", {
    name: `Selected Project: ${envA.name} (${projectA.name})`,
  });
  userEvent.click(toggle);

  const listItem = screen.getByRole("menuitem", {
    name: `${envB.name} (${projectB.name})`,
  });

  expect(listItem).toBeVisible();

  userEvent.click(listItem);

  expect(
    screen.queryByRole("button", {
      name: `Selected Project: ${envB.name} (${projectB.name})`,
    })
  ).toBeVisible();
  expect(selectedProject).toEqual(projectB.id);
  expect(selectedEnv).toEqual(envB.id);
});

test.each`
  inputValue          | numberOfMatchedItems
  ${"project_name"}   | ${5}
  ${"project_name_a"} | ${1}
`(
  "GIVEN EnvironmentSelector and populated store WHEN user types in '$inputValue' THEN shows $numberOfMatchedItems items",
  ({ inputValue, numberOfMatchedItems }) => {
    const [project] = Project.list;
    const [env] = project.environments;

    render(
      <MemoryRouter>
        <EnvironmentSelector
          projects={RemoteData.success(Project.list)}
          onSelectEnvironment={() => {
            return;
          }}
          selectedProjectAndEnvironment={RemoteData.success({
            environment: env,
            project,
          })}
        />
      </MemoryRouter>
    );

    const toggle = screen.getByRole("button", {
      name: `Selected Project: ${env.name} (${project.name})`,
    });
    userEvent.click(toggle);

    const menuItemsBefore = screen.getAllByRole("menuitem");
    expect(menuItemsBefore).toHaveLength(5);

    const input = screen.getByRole("searchbox", { name: "Filter Projects" });
    userEvent.type(input, inputValue);

    const menuItemsAfter = screen.getAllByRole("menuitem");
    expect(menuItemsAfter).toHaveLength(numberOfMatchedItems);
  }
);

test("GIVEN EnvironmentSelector and populated store WHEN user types in non matching text THEN shows no items", () => {
  const [project] = Project.list;
  const [env] = project.environments;
  render(
    <MemoryRouter>
      <EnvironmentSelector
        projects={RemoteData.success(Project.list)}
        onSelectEnvironment={() => {
          return;
        }}
        selectedProjectAndEnvironment={RemoteData.success({
          environment: env,
          project,
        })}
      />
    </MemoryRouter>
  );

  const toggle = screen.getByRole("button", {
    name: `Selected Project: ${env.name} (${project.name})`,
  });
  userEvent.click(toggle);

  const menuItemsBefore = screen.getAllByRole("menuitem");
  expect(menuItemsBefore).toHaveLength(5);

  const input = screen.getByRole("searchbox", { name: "Filter Projects" });
  userEvent.type(input, "non_existing_project_name");

  const menuItemsAfter = screen.queryByRole("menuitem");
  expect(menuItemsAfter).not.toBeInTheDocument();
});

test("GIVEN EnvironmentSelector and environments with identical names WHEN user clicks on an environment THEN the correct environment is selected", () => {
  let selectedEnv;
  let selectedProject;
  const [projectA, projectB] = Project.list;
  const [envA] = projectA.environments;
  const [, envB] = projectB.environments;
  render(
    <MemoryRouter>
      <EnvironmentSelector
        projects={RemoteData.success(Project.list)}
        onSelectEnvironment={(item) => {
          (selectedEnv = item.environmentId),
            (selectedProject = item.projectId);
        }}
        selectedProjectAndEnvironment={RemoteData.success({
          environment: envA,
          project: projectA,
        })}
      />
    </MemoryRouter>
  );
  const toggle = screen.getByRole("button", {
    name: `Selected Project: ${envA.name} (${projectA.name})`,
  });
  userEvent.click(toggle);

  const menuItems = screen.getAllByRole("menuitem");
  userEvent.click(menuItems[2]);

  expect(
    screen.getByRole("button", {
      name: `Selected Project: ${envB.name} (${projectB.name})`,
    })
  );

  expect(selectedProject).toEqual(projectB.id);
  expect(selectedEnv).toEqual(envB.id);
});
