import React, { act } from "react";
import { MemoryRouter } from "react-router";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { Either } from "@/Core";
import {
  CommandResolverImpl,
  getStoreInstance,
  QueryResolverImpl,
  CommandManagerResolverImpl,
  QueryManagerResolverImpl,
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
expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

function setup () {
  const apiHelper = new DeferredApiHelper();

  const scheduler = new StaticScheduler();
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolverImpl(store, apiHelper, scheduler, scheduler),
  );
  const commandResolver = new CommandResolverImpl(
    new CommandManagerResolverImpl(store, apiHelper),
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

  await act(async () => {
    apiHelper.resolve(
      Either.right({
        data: Project.filterable,
      }),
    );
  });

  expect(await screen.findByRole("button", { name: "submit" })).toBeDisabled();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("Given CreateEnvironmentForm When no projects are known, THEN cannot add empty project name", async () => {
  const { component, apiHelper } = setup();

  render(component);

  await act(async () => {
    apiHelper.resolve(
      Either.right({
        data: [],
      }),
    );
  });

  const inputProject = await screen.findByRole("combobox", {
    name: "Project Name-select-toggleFilterInput",
  });

  await userEvent.click(inputProject);

  expect(screen.queryByRole("option")).not.toBeInTheDocument();

  await userEvent.type(inputProject, "    ");

  expect(screen.queryByRole("option")).not.toBeInTheDocument();

  await userEvent.clear(inputProject);

  expect(screen.queryByRole("option")).not.toBeInTheDocument();

  await userEvent.type(inputProject, "test");

  expect(screen.getByRole("option")).toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("Given CreateEnvironmentForm When an existing project and valid environment are set and submit is clicked Then sends the correct request", async () => {
  const { component, apiHelper } = setup();

  render(component);
  await act(async () => {
    apiHelper.resolve(
      Either.right({
        data: Project.filterable,
      }),
    );
  });

  await userEvent.click(
    await screen.findByRole("combobox", {
      name: "Project Name-select-toggleFilterInput",
    }),
  );

  await userEvent.click(
    await screen.findByRole("option", { name: Project.filterable[0].name }),
  );

  const textBox = await screen.findByRole("textbox", { name: "Name-input" });

  await userEvent.clear(textBox);

  await userEvent.type(textBox, "dev{enter}");

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });

  await userEvent.click(await screen.findByRole("button", { name: "submit" }));

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "PUT",
    body: {
      name: "dev",
      project_id: "1",
    },
    url: "/api/v2/environment",
  });
});

test("Given CreateEnvironmentForm When an existing project, a valid environment and repository settings are set and submit is clicked Then sends the correct request", async () => {
  const { component, apiHelper } = setup();

  render(component);

  await act(async () => {
    apiHelper.resolve(
      Either.right({
        data: Project.filterable,
      }),
    );
  });

  await userEvent.click(
    await screen.findByRole("combobox", {
      name: "Project Name-select-toggleFilterInput",
    }),
  );

  await userEvent.click(
    await screen.findByRole("option", { name: Project.filterable[0].name }),
  );

  const textBox = await screen.findByRole("textbox", { name: "Name-input" });

  await userEvent.clear(textBox);
  await userEvent.type(textBox, "dev{enter}");

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

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });

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
    url: "/api/v2/environment",
  });
});

test("Given CreateEnvironmentForm When a new project and valid environment are set and submit is clicked Then sends the correct requests", async () => {
  const { component, apiHelper } = setup();

  await act(async () => {
    render(component);
  });

  await act(async () => {
    apiHelper.resolve(
      Either.right({
        data: Project.filterable,
      }),
    );
  });

  await userEvent.click(
    await screen.findByRole("combobox", {
      name: "Project Name-select-toggleFilterInput",
    }),
  );

  await userEvent.type(
    await screen.findByRole("combobox", {
      name: "Project Name-select-toggleFilterInput",
    }),
    "new-project",
  );

  await userEvent.click(
    await screen.findByRole("option", { name: "Create \"new-project\"" }),
  );

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });

  const request = apiHelper.pendingRequests[0];

  expect(request).toEqual({
    method: "PUT",
    body: {
      name: "new-project",
    },
    url: "/api/v2/project",
  });

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: Project.a }));
  });

  expect(apiHelper.resolvedRequests).toHaveLength(2);
  const updatedProjects = [
    ...Project.filterable,
    { name: "new-project", id: "proj-id-new", environments: [] },
  ];

  await act(async () => {
    apiHelper.resolve(Either.right({ data: updatedProjects }));
  });

  const textBox = await screen.findByRole("textbox", { name: "Name-input" });

  await userEvent.clear(textBox);
  await userEvent.type(textBox, "dev{enter}");

  await userEvent.click(await screen.findByRole("button", { name: "submit" }));

  expect(apiHelper.pendingRequests).toHaveLength(1);

  const environmentRequest = apiHelper.pendingRequests[0];

  expect(environmentRequest).toEqual({
    method: "PUT",
    body: {
      name: "dev",
      project_id: "proj-id-new",
    },
    url: "/api/v2/environment",
  });

  await act(async () => {
    apiHelper.resolve(Either.right({ data: Environment.a }));
  });

  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: "/api/v2/project?environment_details=false",
  });
});

test("Given CreateEnvironmentForm When creating a new project is not successful Then shows error message", async () => {
  const { component, apiHelper } = setup();

  render(component);

  await act(async () => {
    apiHelper.resolve(
      Either.right({
        data: Project.filterable,
      }),
    );
  });

  await userEvent.click(
    await screen.findByRole("combobox", {
      name: "Project Name-select-toggleFilterInput",
    }),
  );

  await userEvent.type(
    await screen.findByRole("combobox", {
      name: "Project Name-select-toggleFilterInput",
    }),
    "new-project",
  );

  await userEvent.click(
    screen.getByRole("option", { name: "Create \"new-project\"" }),
  );

  const request = apiHelper.pendingRequests[0];

  expect(request).toEqual({
    method: "PUT",
    body: {
      name: "new-project",
    },
    url: "/api/v2/project",
  });

  await act(async () => {
    await apiHelper.resolve(
      Either.left("Unexpected error while trying to create new project"),
    );
  });

  expect(
    await screen.findByRole("generic", { name: "Project Name-error-message" }),
  ).toBeVisible();

  await userEvent.click(
    screen.getByRole("button", { name: "Project Name-close-error" }),
  );

  expect(
    screen.queryByRole("generic", { name: "Project Name-error-message" }),
  ).not.toBeInTheDocument();
});

test(`Given CreateEnvironmentForm When an existing project and invalid environment are set and submit is clicked 
      Then shows the error message`, async () => {
  const { component, apiHelper } = setup();

  render(component);

  await act(async () => {
    apiHelper.resolve(
      Either.right({
        data: Project.filterable,
      }),
    );
  });

  // Input data
  await userEvent.click(
    await screen.findByRole("combobox", {
      name: "Project Name-select-toggleFilterInput",
    }),
  );

  await userEvent.click(
    await screen.findByRole("option", { name: Project.filterable[0].name }),
  );

  const textBox = await screen.findByRole("textbox", { name: "Name-input" });

  await userEvent.clear(textBox);
  await userEvent.type(textBox, "test-env1{enter}");

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
    url: "/api/v2/environment",
  });

  await act(async () => {
    await apiHelper.resolve(Either.left("Environment already exists"));
  });

  expect(apiHelper.pendingRequests).toHaveLength(0);
  // Alert is visible and can be closed
  expect(
    await screen.findByRole("generic", { name: "submit-error-message" }),
  ).toBeVisible();

  await userEvent.click(
    screen.getByRole("button", { name: "submit-close-error" }),
  );

  expect(
    screen.queryByRole("generic", { name: "submit-error-message" }),
  ).not.toBeInTheDocument();
});

test("Given CreateEnvironmentForm When an existing project, a valid environment and description are set and submit is clicked Then sends the correct requests", async () => {
  const { component, apiHelper } = setup();

  render(component);

  await act(async () => {
    apiHelper.resolve(
      Either.right({
        data: Project.filterable,
      }),
    );
  });

  await userEvent.click(
    await screen.findByRole("combobox", {
      name: "Project Name-select-toggleFilterInput",
    }),
  );

  await userEvent.click(
    await screen.findByRole("option", { name: Project.filterable[0].name }),
  );

  const textBox = await screen.findByRole("textbox", { name: "Name-input" });

  await userEvent.clear(textBox);
  await userEvent.type(textBox, "dev{enter}");

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
    url: "/api/v2/environment",
  });
});

test("Given CreateEnvironmentForm When an existing project, a valid environment and repository settings are set then removed and submit is clicked Then sends the correct request", async () => {
  const { component, apiHelper } = setup();

  render(component);

  await act(async () => {
    apiHelper.resolve(
      Either.right({
        data: Project.filterable,
      }),
    );
  });

  await userEvent.click(
    await screen.findByRole("combobox", {
      name: "Project Name-select-toggleFilterInput",
    }),
  );

  await userEvent.click(
    await screen.findByRole("option", { name: Project.filterable[0].name }),
  );

  const textBox = await screen.findByRole("textbox", { name: "Name-input" });

  await userEvent.clear(textBox);
  await userEvent.type(textBox, "dev{enter}");

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
    url: "/api/v2/environment",
  });
});
