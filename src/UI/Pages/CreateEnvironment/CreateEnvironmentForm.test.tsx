import React from "react";
import { MemoryRouter } from "react-router";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either, Maybe } from "@/Core";
import {
  CommandResolverImpl,
  CreateEnvironmentCommandManager,
  CreateProjectCommandManager,
  getStoreInstance,
  GetProjectsQueryManager,
  GetProjectsStateHelper,
  ProjectsUpdater,
  QueryResolverImpl,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
  Project,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { Page } from "./Page";

function setup() {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const projectsStateHelper = new GetProjectsStateHelper(store);
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new GetProjectsQueryManager(apiHelper, projectsStateHelper),
    ])
  );

  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      new CreateProjectCommandManager(
        apiHelper,
        new ProjectsUpdater(projectsStateHelper, apiHelper)
      ),
      new CreateEnvironmentCommandManager(apiHelper),
    ])
  );

  const component = (
    <MemoryRouter>
      <StoreProvider store={store}>
        <DependencyProvider
          dependencies={{ ...dependencies, queryResolver, commandResolver }}
        >
          <Page />
        </DependencyProvider>
      </StoreProvider>
    </MemoryRouter>
  );

  return { component, apiHelper };
}

test("Given CreateEnvironmentForm When project and environment are not set Then the submit button is disabled", async () => {
  const { component, apiHelper } = setup();
  render(component);

  apiHelper.resolve(
    Either.right({
      data: Project.filterable,
    })
  );

  expect(await screen.findByRole("button", { name: "submit" })).toBeDisabled();
});

test(`Given CreateEnvironmentForm When an existing project and valid environment are set and submit is clicked Then sends the correct request`, async () => {
  const { component, apiHelper } = setup();
  render(component);
  apiHelper.resolve(
    Either.right({
      data: Project.filterable,
    })
  );

  userEvent.click(
    await screen.findByRole("button", { name: "Project Name-select-toggle" })
  );
  userEvent.click(
    await screen.findByRole("option", { name: Project.filterable[0].name })
  );

  const textBox = await screen.findByRole("textbox", { name: "Name-input" });
  userEvent.clear(textBox);
  userEvent.type(textBox, `dev{enter}`);

  userEvent.click(await screen.findByRole("button", { name: "submit" }));
  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "PUT",
    body: {
      name: "dev",
      project_id: "1",
    },
    url: `/api/v2/environment`,
  });
});

test(`Given CreateEnvironmentForm When an existing project, a valid environment and repository settings are set and submit is clicked Then sends the correct request`, async () => {
  const { component, apiHelper } = setup();
  render(component);
  apiHelper.resolve(
    Either.right({
      data: Project.filterable,
    })
  );

  userEvent.click(
    await screen.findByRole("button", { name: "Project Name-select-toggle" })
  );
  userEvent.click(
    await screen.findByRole("option", { name: Project.filterable[0].name })
  );

  const textBox = await screen.findByRole("textbox", { name: "Name-input" });
  userEvent.clear(textBox);
  userEvent.type(textBox, `dev{enter}`);

  const repository = "github.com/test-env";
  const branch = "dev";
  const branchTextBox = await screen.findByRole("textbox", {
    name: "Branch-input",
  });
  userEvent.clear(branchTextBox);
  userEvent.type(branchTextBox, branch);
  const urlTextBox = await screen.findByRole("textbox", {
    name: "Repository-input",
  });
  userEvent.clear(urlTextBox);
  userEvent.type(urlTextBox, repository);

  userEvent.click(await screen.findByRole("button", { name: "submit" }));
  expect(apiHelper.pendingRequests).toHaveLength(1);
  const request = apiHelper.pendingRequests[0];
  expect(request).toEqual({
    method: "PUT",
    body: {
      name: "dev",
      project_id: "1",
      repository,
      branch,
    },
    url: `/api/v2/environment`,
  });
});

test(`Given CreateEnvironmentForm When a new project and valid environment are set and submit is clicked Then sends the correct requests`, async () => {
  const { component, apiHelper } = setup();
  render(component);

  apiHelper.resolve(
    Either.right({
      data: Project.filterable,
    })
  );

  userEvent.click(
    await screen.findByRole("button", { name: "Project Name-select-toggle" })
  );
  userEvent.type(
    await screen.findByRole("textbox", { name: "Project Name-typeahead" }),
    "new-project{enter}"
  );
  const request = apiHelper.pendingRequests[0];
  expect(request).toEqual({
    method: "PUT",
    body: {
      name: "new-project",
    },
    url: `/api/v2/project`,
  });
  await act(async () => {
    await apiHelper.resolve(Maybe.none());
  });
  expect(apiHelper.resolvedRequests).toHaveLength(2);
  const updatedProjects = [
    ...Project.filterable,
    { name: "new-project", id: "proj-id-new", environments: [] },
  ];
  apiHelper.resolve(Either.right({ data: updatedProjects }));

  const textBox = await screen.findByRole("textbox", { name: "Name-input" });
  userEvent.clear(textBox);
  userEvent.type(textBox, `dev{enter}`);
  await act(async () => {
    userEvent.click(await screen.findByRole("button", { name: "submit" }));
  });

  expect(apiHelper.pendingRequests).toHaveLength(1);
  const environmentRequest = apiHelper.pendingRequests[0];
  expect(environmentRequest).toEqual({
    method: "PUT",
    body: {
      name: "dev",
      project_id: "proj-id-new",
    },
    url: `/api/v2/environment`,
  });
});

test("Given CreateEnvironmentForm When creating a new project is not successful Then shows error message", async () => {
  const { component, apiHelper } = setup();
  render(component);
  apiHelper.resolve(
    Either.right({
      data: Project.filterable,
    })
  );
  userEvent.click(
    await screen.findByRole("button", { name: "Project Name-select-toggle" })
  );
  userEvent.type(
    await screen.findByRole("textbox", { name: "Project Name-typeahead" }),
    "new-project{enter}"
  );
  const request = apiHelper.pendingRequests[0];
  expect(request).toEqual({
    method: "PUT",
    body: {
      name: "new-project",
    },
    url: `/api/v2/project`,
  });
  await act(async () => {
    await apiHelper.resolve(
      Maybe.some("Unexpected error while trying to create new project")
    );
  });

  expect(
    await screen.findByRole("generic", { name: "Project Name-error-message" })
  ).toBeVisible();
  userEvent.click(
    screen.getByRole("button", { name: "Project Name-close-error" })
  );
  expect(
    screen.queryByRole("generic", { name: "Project Name-error-message" })
  ).not.toBeInTheDocument();
});

test(`Given CreateEnvironmentForm When an existing project and invalid environment are set and submit is clicked 
      Then shows the error message`, async () => {
  const { component, apiHelper } = setup();
  render(component);
  apiHelper.resolve(
    Either.right({
      data: Project.filterable,
    })
  );
  // Input data
  userEvent.click(
    await screen.findByRole("button", { name: "Project Name-select-toggle" })
  );
  userEvent.click(
    await screen.findByRole("option", { name: Project.filterable[0].name })
  );

  const textBox = await screen.findByRole("textbox", { name: "Name-input" });
  userEvent.clear(textBox);
  userEvent.type(textBox, `test-env1{enter}`);
  // Submit request
  userEvent.click(await screen.findByRole("button", { name: "submit" }));
  expect(apiHelper.pendingRequests).toHaveLength(1);
  const request = apiHelper.pendingRequests[0];
  expect(request).toEqual({
    method: "PUT",
    body: {
      name: "test-env1",
      project_id: "1",
    },
    url: `/api/v2/environment`,
  });
  await act(async () => {
    await apiHelper.resolve(Maybe.some("Environment already exists"));
  });
  expect(apiHelper.pendingRequests).toHaveLength(0);
  // Alert is visible and can be closed
  expect(
    await screen.findByRole("generic", { name: "submit-error-message" })
  ).toBeVisible();
  userEvent.click(screen.getByRole("button", { name: "submit-close-error" }));
  expect(
    screen.queryByRole("generic", { name: "submit-error-message" })
  ).not.toBeInTheDocument();
});

test(`Given CreateEnvironmentForm When an existing project, a valid environment and description are set and submit is clicked Then sends the correct requests`, async () => {
  const { component, apiHelper } = setup();
  render(component);

  apiHelper.resolve(
    Either.right({
      data: Project.filterable,
    })
  );

  userEvent.click(
    await screen.findByRole("button", { name: "Project Name-select-toggle" })
  );
  userEvent.click(
    await screen.findByRole("option", { name: Project.filterable[0].name })
  );

  const textBox = await screen.findByRole("textbox", { name: "Name-input" });
  userEvent.clear(textBox);
  userEvent.type(textBox, `dev{enter}`);

  const description = "description text";
  const descriptionInput = screen.getByRole("textbox", {
    name: "Description-input",
  });
  userEvent.clear(descriptionInput);
  userEvent.type(descriptionInput, description);

  userEvent.click(await screen.findByRole("button", { name: "submit" }));
  expect(apiHelper.pendingRequests).toHaveLength(1);
  const request = apiHelper.pendingRequests[0];
  expect(request).toEqual({
    method: "PUT",
    body: {
      name: "dev",
      project_id: "1",
      description,
    },
    url: `/api/v2/environment`,
  });
});

test(`Given CreateEnvironmentForm When an existing project, a valid environment and repository settings are set then removed and submit is clicked Then sends the correct request`, async () => {
  const { component, apiHelper } = setup();
  render(component);
  apiHelper.resolve(
    Either.right({
      data: Project.filterable,
    })
  );

  await userEvent.click(
    await screen.findByRole("button", { name: "Project Name-select-toggle" })
  );
  await userEvent.click(
    await screen.findByRole("option", { name: Project.filterable[0].name })
  );

  const textBox = await screen.findByRole("textbox", { name: "Name-input" });
  await userEvent.clear(textBox);
  await userEvent.type(textBox, `dev{enter}`);

  const branch = "dev";
  const branchTextBox = await screen.findByRole("textbox", {
    name: "Branch-input",
  });
  await userEvent.clear(branchTextBox);
  await userEvent.type(branchTextBox, branch);

  const repository = "github.com/test-env";
  const urlTextBox = await screen.findByRole("textbox", {
    name: "Repository-input",
  });
  await userEvent.clear(urlTextBox);
  await userEvent.type(urlTextBox, repository);

  await userEvent.clear(branchTextBox);
  await userEvent.clear(urlTextBox);

  await userEvent.click(await screen.findByRole("button", { name: "submit" }));
  expect(apiHelper.pendingRequests).toHaveLength(1);
  const request = apiHelper.pendingRequests[0];
  expect(request).toEqual({
    //branch and repository should not be present in the body
    method: "PUT",
    body: {
      name: "dev",
      project_id: "1",
    },
    url: `/api/v2/environment`,
  });
});
