import React from "react";
import { MemoryRouter } from "react-router";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import {
  CommandResolverImpl,
  getStoreInstance,
  QueryResolverImpl,
  CommandManagerResolver,
  KeycloakAuthHelper,
  QueryManagerResolver,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  Environment,
  Project,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { Page } from "./Page";

function setup() {
  const apiHelper = new DeferredApiHelper();
  const authHelper = new KeycloakAuthHelper();
  const scheduler = new StaticScheduler();
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolver(store, apiHelper, scheduler, scheduler)
  );
  const commandResolver = new CommandResolverImpl(
    new CommandManagerResolver(store, apiHelper, authHelper)
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

  await userEvent.click(
    await screen.findByRole("button", { name: "Project Name-select-toggle" })
  );
  await userEvent.click(
    await screen.findByRole("option", { name: Project.filterable[0].name })
  );

  const textBox = await screen.findByRole("textbox", { name: "Name-input" });
  await userEvent.clear(textBox);
  await userEvent.type(textBox, `dev{enter}`);

  await userEvent.click(await screen.findByRole("button", { name: "submit" }));
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

  await userEvent.click(
    await screen.findByRole("button", { name: "Project Name-select-toggle" })
  );
  await userEvent.click(
    await screen.findByRole("option", { name: Project.filterable[0].name })
  );

  const textBox = await screen.findByRole("textbox", { name: "Name-input" });
  await userEvent.clear(textBox);
  await userEvent.type(textBox, `dev{enter}`);

  const repository = "github.com/test-env";
  const branch = "dev";
  const branchTextBox = await screen.findByRole("textbox", {
    name: "Branch-input",
  });
  await userEvent.clear(branchTextBox);
  await userEvent.type(branchTextBox, branch);
  const urlTextBox = await screen.findByRole("textbox", {
    name: "Repository-input",
  });
  await userEvent.clear(urlTextBox);
  await userEvent.type(urlTextBox, repository);

  await userEvent.click(await screen.findByRole("button", { name: "submit" }));
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

  await userEvent.click(
    await screen.findByRole("button", { name: "Project Name-select-toggle" })
  );
  await userEvent.type(
    await screen.findByRole("textbox", { name: "Project Name-typeahead" }),
    "new-project"
  );
  await userEvent.click(
    screen.getByRole("option", { name: 'Create "new-project"' })
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
    await apiHelper.resolve(Either.right({ data: Project.a }));
  });
  expect(apiHelper.resolvedRequests).toHaveLength(2);
  const updatedProjects = [
    ...Project.filterable,
    { name: "new-project", id: "proj-id-new", environments: [] },
  ];
  apiHelper.resolve(Either.right({ data: updatedProjects }));

  const textBox = await screen.findByRole("textbox", { name: "Name-input" });
  await userEvent.clear(textBox);
  await userEvent.type(textBox, `dev{enter}`);
  await act(async () => {
    await userEvent.click(
      await screen.findByRole("button", { name: "submit" })
    );
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
  await act(async () => {
    apiHelper.resolve(Either.right({ data: Environment.a }));
  });
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: `/api/v2/project?environment_details=false`,
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
  await userEvent.click(
    await screen.findByRole("button", { name: "Project Name-select-toggle" })
  );
  await userEvent.type(
    await screen.findByRole("textbox", { name: "Project Name-typeahead" }),
    "new-project"
  );
  await userEvent.click(
    screen.getByRole("option", { name: 'Create "new-project"' })
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
      Either.left("Unexpected error while trying to create new project")
    );
  });

  expect(
    await screen.findByRole("generic", { name: "Project Name-error-message" })
  ).toBeVisible();
  await userEvent.click(
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
  await userEvent.click(
    await screen.findByRole("button", { name: "Project Name-select-toggle" })
  );
  await userEvent.click(
    await screen.findByRole("option", { name: Project.filterable[0].name })
  );

  const textBox = await screen.findByRole("textbox", { name: "Name-input" });
  await userEvent.clear(textBox);
  await userEvent.type(textBox, `test-env1{enter}`);
  // Submit request
  await userEvent.click(await screen.findByRole("button", { name: "submit" }));
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
    await apiHelper.resolve(Either.left("Environment already exists"));
  });
  expect(apiHelper.pendingRequests).toHaveLength(0);
  // Alert is visible and can be closed
  expect(
    await screen.findByRole("generic", { name: "submit-error-message" })
  ).toBeVisible();
  await userEvent.click(
    screen.getByRole("button", { name: "submit-close-error" })
  );
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

  await userEvent.click(
    await screen.findByRole("button", { name: "Project Name-select-toggle" })
  );
  await userEvent.click(
    await screen.findByRole("option", { name: Project.filterable[0].name })
  );

  const textBox = await screen.findByRole("textbox", { name: "Name-input" });
  await userEvent.clear(textBox);
  await userEvent.type(textBox, `dev{enter}`);

  const description = "description text";
  const descriptionInput = screen.getByRole("textbox", {
    name: "Description-input",
  });
  await userEvent.clear(descriptionInput);
  await userEvent.type(descriptionInput, description);

  await userEvent.click(await screen.findByRole("button", { name: "submit" }));
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
