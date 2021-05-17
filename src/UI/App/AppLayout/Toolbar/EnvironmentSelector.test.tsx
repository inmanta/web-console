import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EnvSelectorWithData as EnvironmentSelector } from "./EnvSelectorWithData";
import { RemoteData } from "@/Core";
import { testProjects } from "@/Test";

const projects = testProjects;

test("GIVEN EnvironmentSelector WHEN no environments THEN error view", async () => {
  render(
    <EnvironmentSelector
      projects={RemoteData.success([])}
      onSelectEnvironment={() => {
        return;
      }}
      selectedProjectAndEnvironment={RemoteData.failed(
        "No environments were found"
      )}
    />
  );

  expect(
    await screen.findByRole("generic", { name: "EnvSelector-Failed" })
  ).toBeInTheDocument();
});

test("GIVEN EnvironmentSelector and a project WHEN user clicks on toggle THEN list of projects is shown", () => {
  render(
    <EnvironmentSelector
      projects={RemoteData.success(projects)}
      onSelectEnvironment={() => {
        return;
      }}
      selectedProjectAndEnvironment={RemoteData.success({
        environment: projects[0].environments[0],
        project: projects[0],
      })}
    />
  );

  const toggle = screen.getByRole("button", {
    name: "Selected Project: test-project-1 / test-environment-1",
  });
  userEvent.click(toggle);
  const listItem = screen.queryByRole("menuitem", {
    name: "test-project-2 / test-environment-2",
  });

  expect(listItem).toBeVisible();
});

test("GIVEN EnvironmentSelector and populated store WHEN user clicks on an item THEN selected environment is changed", () => {
  let selectedEnv;
  let selectedProject;
  render(
    <EnvironmentSelector
      projects={RemoteData.success(projects)}
      onSelectEnvironment={(item) => {
        (selectedEnv = item.environmentId), (selectedProject = item.projectId);
      }}
      selectedProjectAndEnvironment={RemoteData.success({
        environment: projects[0].environments[0],
        project: projects[0],
      })}
    />
  );

  const toggle = screen.getByRole("button", {
    name: "Selected Project: test-project-1 / test-environment-1",
  });
  userEvent.click(toggle);

  const listItem = screen.getByRole("menuitem", {
    name: "test-project-2 / test-environment-2",
  });

  expect(listItem).toBeVisible();

  userEvent.click(listItem);

  expect(
    screen.queryByRole("button", {
      name: "Selected Project: test-project-2 / test-environment-2",
    })
  ).toBeVisible();
  expect(selectedProject).toEqual("project-id-2");
  expect(selectedEnv).toEqual("env-id-2");
});

test.each`
  inputValue | numberOfMatchedItems
  ${"test"}  | ${5}
  ${"5"}     | ${1}
`(
  "GIVEN EnvironmentSelector and populated store WHEN user types in '$inputValue' THEN shows $numberOfMatchedItems items",
  ({ inputValue, numberOfMatchedItems }) => {
    render(
      <EnvironmentSelector
        projects={RemoteData.success(projects)}
        onSelectEnvironment={() => {
          return;
        }}
        selectedProjectAndEnvironment={RemoteData.success({
          environment: projects[0].environments[0],
          project: projects[0],
        })}
      />
    );

    const toggle = screen.getByRole("button", {
      name: "Selected Project: test-project-1 / test-environment-1",
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
  render(
    <EnvironmentSelector
      projects={RemoteData.success(projects)}
      onSelectEnvironment={() => {
        return;
      }}
      selectedProjectAndEnvironment={RemoteData.success({
        environment: projects[0].environments[0],
        project: projects[0],
      })}
    />
  );

  const toggle = screen.getByRole("button", {
    name: "Selected Project: test-project-1 / test-environment-1",
  });
  userEvent.click(toggle);

  const menuItemsBefore = screen.getAllByRole("menuitem");
  expect(menuItemsBefore).toHaveLength(5);

  const input = screen.getByRole("searchbox", { name: "Filter Projects" });
  userEvent.type(input, "abcd");

  const menuItemsAfter = screen.queryByRole("menuitem");
  expect(menuItemsAfter).not.toBeInTheDocument();
});

test("GIVEN EnvironmentSelector and environments with identital names WHEN user clicks on an environment THEN the correct environment is selected", () => {
  let selectedEnv;
  let selectedProject;
  render(
    <EnvironmentSelector
      projects={RemoteData.success(projects)}
      onSelectEnvironment={(item) => {
        (selectedEnv = item.environmentId), (selectedProject = item.projectId);
      }}
      selectedProjectAndEnvironment={RemoteData.success({
        environment: projects[0].environments[0],
        project: projects[0],
      })}
    />
  );
  const toggle = screen.getByRole("button", {
    name: "Selected Project: test-project-1 / test-environment-1",
  });
  userEvent.click(toggle);

  const menuItems = screen.getAllByRole("menuitem");
  userEvent.click(menuItems[2]);

  expect(
    screen.getByRole("button", {
      name: "Selected Project: test-project-2 / test-environment-1",
    })
  );

  expect(selectedProject).toEqual("project-id-2");
  expect(selectedEnv).toEqual("env-id-3");
});
