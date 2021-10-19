import React from "react";
import { Either, Maybe } from "@/Core";
import {
  CommandResolverImpl,
  FetcherImpl,
  getStoreInstance,
  ModifyEnvironmentCommandManager,
  ModifyEnvironmentPoster,
  ProjectsQueryManager,
  ProjectsStateHelper,
  ProjectsUpdater,
  QueryResolverImpl,
} from "@/Data";
import {
  DeferredApiHelper,
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
  Project,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { act, render, screen } from "@testing-library/react";
import userEvent, { specialChars } from "@testing-library/user-event";
import { EnvironmentSettings } from "./EnvironmentSettings";

const selectedEnvironment = Project.filterable[0].environments[0];

function setup() {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const projectsFetcher = new FetcherImpl<"Projects">(apiHelper);
  const projectsStateHelper = new ProjectsStateHelper(store);
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new ProjectsQueryManager(projectsFetcher, projectsStateHelper),
    ])
  );

  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      new ModifyEnvironmentCommandManager(
        new ModifyEnvironmentPoster(apiHelper, selectedEnvironment.id),
        new ProjectsUpdater(projectsStateHelper, projectsFetcher)
      ),
    ])
  );

  const component = (
    <DependencyProvider dependencies={{ queryResolver, commandResolver }}>
      <EnvironmentSettings
        environment={selectedEnvironment}
        project={Project.filterable[0]}
      />
    </DependencyProvider>
  );

  return { component, apiHelper };
}

test("Given environment settings When clicking on the edit name button Then the input field is shown", async () => {
  const { component } = setup();
  render(component);
  expect(
    await screen.findByRole("generic", { name: "Name-value" })
  ).toBeVisible();
  userEvent.click(screen.getByRole("button", { name: "Name-toggle-edit" }));
  expect(
    await screen.findByRole("textbox", { name: "Name-input" })
  ).toBeVisible();
  expect(
    screen.queryByRole("generic", { name: "Name-value" })
  ).not.toBeInTheDocument();
});

test("Given environment settings When submitting the edited name Then the backend request is fired", async () => {
  const { component, apiHelper } = setup();
  render(component);
  userEvent.click(screen.getByRole("button", { name: "Name-toggle-edit" }));
  const textBox = await screen.findByRole("textbox", { name: "Name-input" });
  userEvent.clear(textBox);
  userEvent.type(textBox, `dev${specialChars.enter}`);
  expect(apiHelper.pendingRequests).toHaveLength(1);
  const request = apiHelper.pendingRequests[0];
  expect(request.request).toEqual({
    method: "POST",
    environment: selectedEnvironment.id,
    body: {
      id: selectedEnvironment.id,
      name: "dev",
    },
    url: `/api/v2/environment/${selectedEnvironment.id}`,
  });
  await act(async () => {
    await apiHelper.resolve(Maybe.none());
  });
  expect(apiHelper.resolvedRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests).toHaveLength(1);
  await act(async () => {
    await apiHelper.resolve(Either.right(Project.filterable));
  });
  expect(apiHelper.resolvedRequests).toHaveLength(2);
  expect(apiHelper.pendingRequests).toHaveLength(0);
  expect(
    await screen.findByRole("generic", { name: "Name-value" })
  ).toHaveTextContent("dev");
  expect(
    screen.queryByRole("textbox", { name: "Name-input" })
  ).not.toBeInTheDocument();
});

test("Given environment settings When canceling a name edit Then the backend request is not fired", async () => {
  const { component, apiHelper } = setup();
  render(component);
  userEvent.click(screen.getByRole("button", { name: "Name-toggle-edit" }));
  const textBox = await screen.findByRole("textbox", { name: "Name-input" });
  userEvent.clear(textBox);
  userEvent.type(textBox, "dev");
  userEvent.click(screen.getByRole("button", { name: "Name-cancel-edit" }));
  expect(apiHelper.pendingRequests).toHaveLength(0);
  // The field is shown with the original value
  expect(
    await screen.findByRole("generic", { name: "Name-value" })
  ).toHaveTextContent(selectedEnvironment.name);
  expect(
    screen.queryByRole("textbox", { name: "Name-input" })
  ).not.toBeInTheDocument();
});

test.each`
  displayName                 | elementName
  ${"with the close button"}  | ${"Name-close-error"}
  ${"by starting a new edit"} | ${"Name-toggle-edit"}
`(
  "Given environment settings When a name edit yields an error Then the error message is shown and can be closed $displayName",
  async ({ elementName }) => {
    const { component, apiHelper } = setup();
    render(component);
    userEvent.click(screen.getByRole("button", { name: "Name-toggle-edit" }));
    const textBox = await screen.findByRole("textbox", { name: "Name-input" });
    userEvent.clear(textBox);
    userEvent.type(textBox, `dev${specialChars.enter}`);
    expect(apiHelper.pendingRequests).toHaveLength(1);
    await act(async () => {
      await apiHelper.resolve(Maybe.some("Invalid environment name"));
    });
    await act(async () => {
      await apiHelper.resolve(Either.right(Project.filterable));
    });
    expect(
      await screen.findByRole("generic", { name: "Name-error-message" })
    ).toBeVisible();

    // The field is shown with the original value
    expect(
      await screen.findByRole("generic", { name: "Name-value" })
    ).toHaveTextContent(selectedEnvironment.name);
    expect(
      screen.queryByRole("textbox", { name: "Name-input" })
    ).not.toBeInTheDocument();

    // Closing the alert
    userEvent.click(screen.getByRole("button", { name: elementName }));
    expect(
      screen.queryByRole("generic", { name: "Name-error-message" })
    ).not.toBeInTheDocument();
  }
);

test("Given environment settings When clicking on the edit repository settings button Then the input fields are shown", async () => {
  const { component } = setup();
  render(component);
  expect(
    await screen.findByRole("generic", { name: "repo_branch-value" })
  ).toBeVisible();
  expect(
    await screen.findByRole("generic", { name: "repo_url-value" })
  ).toBeVisible();
  userEvent.click(
    screen.getByRole("button", { name: "Repository Settings-toggle-edit" })
  );
  expect(
    await screen.findByRole("textbox", { name: "repo_branch-input" })
  ).toBeVisible();
  expect(
    await screen.findByRole("textbox", { name: "repo_url-input" })
  ).toBeVisible();
  expect(
    screen.queryByRole("generic", { name: "repo_branch-value" })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("generic", { name: "repo_url-value" })
  ).not.toBeInTheDocument();
});

test("Given environment settings When submitting the edited repository settings Then the backend request is fired", async () => {
  const { component, apiHelper } = setup();
  render(component);
  const newRepository = "github.com/test-env";
  const newBranch = "dev";
  userEvent.click(
    screen.getByRole("button", { name: "Repository Settings-toggle-edit" })
  );
  const branchTextBox = await screen.findByRole("textbox", {
    name: "repo_branch-input",
  });
  userEvent.clear(branchTextBox);
  userEvent.type(branchTextBox, newBranch);
  const urlTextBox = await screen.findByRole("textbox", {
    name: "repo_url-input",
  });
  userEvent.clear(urlTextBox);
  userEvent.type(urlTextBox, newRepository);
  userEvent.click(
    screen.getByRole("button", { name: "Repository Settings-submit-edit" })
  );
  expect(apiHelper.pendingRequests).toHaveLength(1);
  const request = apiHelper.pendingRequests[0];
  expect(request.request).toEqual({
    method: "POST",
    environment: selectedEnvironment.id,
    body: {
      id: selectedEnvironment.id,
      name: selectedEnvironment.name,
      repository: newRepository,
      branch: newBranch,
    },
    url: `/api/v2/environment/${selectedEnvironment.id}`,
  });
  await act(async () => {
    await apiHelper.resolve(Maybe.none());
  });
  expect(apiHelper.resolvedRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests).toHaveLength(1);
  await act(async () => {
    await apiHelper.resolve(Either.right(Project.filterable));
  });
  expect(apiHelper.resolvedRequests).toHaveLength(2);
  expect(apiHelper.pendingRequests).toHaveLength(0);
  expect(
    await screen.findByRole("generic", { name: "repo_branch-value" })
  ).toHaveTextContent(newBranch);
  expect(
    await screen.findByRole("generic", { name: "repo_url-value" })
  ).toHaveTextContent(newRepository);
  expect(
    screen.queryByRole("textbox", { name: "repo_branch-value" })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("textbox", { name: "repo_url-value" })
  ).not.toBeInTheDocument();
});

test("Given environment settings When canceling a name edit Then the backend request is not fired", async () => {
  const { component, apiHelper } = setup();
  render(component);
  userEvent.click(
    screen.getByRole("button", { name: "Repository Settings-toggle-edit" })
  );
  const textBox = await screen.findByRole("textbox", {
    name: "repo_branch-input",
  });
  userEvent.clear(textBox);
  userEvent.type(textBox, "dev");
  userEvent.click(
    screen.getByRole("button", { name: "Repository Settings-cancel-edit" })
  );
  expect(apiHelper.pendingRequests).toHaveLength(0);

  // The field is shown with the original value
  expect(
    await screen.findByRole("generic", { name: "repo_branch-value" })
  ).toHaveTextContent(selectedEnvironment.repo_branch);
  expect(
    await screen.findByRole("generic", { name: "repo_url-value" })
  ).toHaveTextContent(selectedEnvironment.repo_url);
  expect(
    screen.queryByRole("textbox", { name: "repo_branch-input" })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("textbox", { name: "repo_url-input" })
  ).not.toBeInTheDocument();
});

test.each`
  displayName                 | elementName
  ${"with the close button"}  | ${"Repository Settings-close-error"}
  ${"by starting a new edit"} | ${"Repository Settings-toggle-edit"}
`(
  "Given environment settings When a repo edit yields an error Then the error message is shown and can be closed $displayName",
  async ({ elementName }) => {
    const { component, apiHelper } = setup();
    render(component);
    userEvent.click(
      screen.getByRole("button", { name: "Repository Settings-toggle-edit" })
    );
    const textBox = await screen.findByRole("textbox", {
      name: "repo_branch-input",
    });
    userEvent.clear(textBox);
    userEvent.type(textBox, `dev${specialChars.enter}`);
    expect(apiHelper.pendingRequests).toHaveLength(1);
    await act(async () => {
      await apiHelper.resolve(Maybe.some("Invalid branch"));
    });
    await act(async () => {
      await apiHelper.resolve(Either.right(Project.filterable));
    });
    expect(
      await screen.findByRole("generic", {
        name: "Repository Settings-error-message",
      })
    ).toBeVisible();

    // The field is shown with the original value
    expect(
      await screen.findByRole("generic", { name: "repo_branch-value" })
    ).toHaveTextContent(selectedEnvironment.repo_branch);
    expect(
      screen.queryByRole("textbox", { name: "repo_branch-input" })
    ).not.toBeInTheDocument();

    // Closing the alert
    userEvent.click(screen.getByRole("button", { name: elementName }));
    expect(
      screen.queryByRole("generic", {
        name: "Repository Settings-error-message",
      })
    ).not.toBeInTheDocument();
  }
);
