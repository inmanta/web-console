import { Either, Maybe } from "@/Core";
import {
  CommandResolverImpl,
  CreateEnvironmentCommandManager,
  CreateProjectCommandManager,
  getStoreInstance,
  ProjectsQueryManager,
  ProjectsStateHelper,
  ProjectsUpdater,
  QueryResolverImpl,
} from "@/Data";
import {
  DeferredApiHelper,
  DeferredFetcher,
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
  Project,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import React from "react";
import { MemoryRouter } from "react-router";
import { Page } from "./Page";

function setup() {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const projectsFetcher = new DeferredFetcher<"Projects">();
  const projectsStateHelper = new ProjectsStateHelper(store);
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new ProjectsQueryManager(projectsFetcher, projectsStateHelper),
    ])
  );

  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      new CreateProjectCommandManager(
        apiHelper,
        new ProjectsUpdater(projectsStateHelper, projectsFetcher)
      ),
      new CreateEnvironmentCommandManager(apiHelper),
    ])
  );

  const component = (
    <MemoryRouter initialEntries={["/console/environment/create"]}>
      <StoreProvider store={store}>
        <DependencyProvider dependencies={{ queryResolver, commandResolver }}>
          <Page />
        </DependencyProvider>
      </StoreProvider>
    </MemoryRouter>
  );

  return { component, apiHelper, projectsFetcher };
}

test("Given CreateEnvironmentForm When project and environment are not set Then the submit button is disabled", async () => {
  const { component, projectsFetcher } = setup();
  render(component);

  projectsFetcher.resolve(
    Either.right({
      data: Project.filterable,
    })
  );

  expect(await screen.findByRole("button", { name: "submit" })).toBeDisabled();
});

test(`Given CreateEnvironmentForm When an existing project and valid environment are set and submit is clicked
      Then sends the correct request`, async () => {
  const { component, apiHelper, projectsFetcher } = setup();
  render(component);
  projectsFetcher.resolve(
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
  userEvent.click(
    await screen.findByRole("button", { name: "Project Name-submit-edit" })
  );

  const textBox = await screen.findByRole("textbox", { name: "Name-input" });
  userEvent.clear(textBox);
  userEvent.type(textBox, `dev{enter}`);

  userEvent.click(await screen.findByRole("button", { name: "submit" }));
  expect(apiHelper.pendingRequests).toHaveLength(1);
  const request = apiHelper.pendingRequests[0];
  expect(request).toEqual({
    method: "PUT",
    body: {
      name: "dev",
      project_id: "1",
    },
    url: `/api/v2/environment`,
  });
});

test(`Given CreateEnvironmentForm When an existing project, a valid environment and repository settings are set and submit is clicked 
      Then sends the correct request`, async () => {
  const { component, apiHelper, projectsFetcher } = setup();
  render(component);
  projectsFetcher.resolve(
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
  userEvent.click(
    await screen.findByRole("button", { name: "Project Name-submit-edit" })
  );

  const textBox = await screen.findByRole("textbox", { name: "Name-input" });
  userEvent.clear(textBox);
  userEvent.type(textBox, `dev{enter}`);

  const repository = "github.com/test-env";
  const branch = "dev";
  userEvent.click(
    screen.getByRole("button", { name: "Repository Settings-toggle-edit" })
  );
  const branchTextBox = await screen.findByRole("textbox", {
    name: "branch-input",
  });
  userEvent.clear(branchTextBox);
  userEvent.type(branchTextBox, branch);
  const urlTextBox = await screen.findByRole("textbox", {
    name: "repository-input",
  });
  userEvent.clear(urlTextBox);
  userEvent.type(urlTextBox, repository);
  userEvent.click(
    screen.getByRole("button", { name: "Repository Settings-submit-edit" })
  );

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

test(`Given CreateEnvironmentForm When a new project and valid environment are set and submit is clicked 
      Then sends the correct requests`, async () => {
  const { component, apiHelper, projectsFetcher } = setup();
  render(component);

  projectsFetcher.resolve(
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
  expect(apiHelper.resolvedRequests).toHaveLength(1);
  const updatedProjects = [
    ...Project.filterable,
    { name: "new-project", id: "proj-id-new", environments: [] },
  ];
  projectsFetcher.resolve(Either.right({ data: updatedProjects }));
  userEvent.click(
    await screen.findByRole("button", { name: "Project Name-submit-edit" })
  );

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
  const { component, apiHelper, projectsFetcher } = setup();
  render(component);
  projectsFetcher.resolve(
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
  const { component, apiHelper, projectsFetcher } = setup();
  render(component);
  projectsFetcher.resolve(
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
  userEvent.click(
    await screen.findByRole("button", { name: "Project Name-submit-edit" })
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
