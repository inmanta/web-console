import React from "react";
import { MemoryRouter } from "react-router-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either, Maybe } from "@/Core";
import {
  CommandResolverImpl,
  getStoreInstance,
  KeycloakAuthHelper,
  CommandManagerResolver,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  Environment,
  MockEnvironmentHandler,
  Project,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { EnvironmentSettings } from "./EnvironmentSettings";

function setup() {
  const selectedEnvironment = Environment.filterable[0];
  const apiHelper = new DeferredApiHelper();
  const authHelper = new KeycloakAuthHelper();
  const store = getStoreInstance();
  const commandResolver = new CommandResolverImpl(
    new CommandManagerResolver(store, apiHelper, authHelper)
  );

  const component = (
    <StoreProvider store={store}>
      <MemoryRouter>
        <DependencyProvider
          dependencies={{
            ...dependencies,
            commandResolver,
            environmentHandler: MockEnvironmentHandler(selectedEnvironment.id),
          }}
        >
          <EnvironmentSettings
            environment={selectedEnvironment}
            projects={Project.list}
          />
        </DependencyProvider>
      </MemoryRouter>
    </StoreProvider>
  );

  return { component, apiHelper, selectedEnvironment };
}

test("Given environment settings When clicking on the edit name button Then the input field is shown", async () => {
  const { component } = setup();
  render(component);
  expect(
    await screen.findByRole("generic", { name: "Name-value" })
  ).toBeVisible();
  await userEvent.click(
    screen.getByRole("button", { name: "Name-toggle-edit" })
  );
  expect(
    await screen.findByRole("textbox", { name: "Name-input" })
  ).toBeVisible();
  expect(
    screen.queryByRole("generic", { name: "Name-value" })
  ).not.toBeInTheDocument();
});

test("Given environment settings When submitting the edited name Then the backend request is fired", async () => {
  const { component, apiHelper, selectedEnvironment } = setup();
  render(component);
  await userEvent.click(
    screen.getByRole("button", { name: "Name-toggle-edit" })
  );
  const textBox = await screen.findByRole("textbox", { name: "Name-input" });
  await userEvent.clear(textBox);
  await userEvent.type(textBox, `dev{enter}`);
  expect(apiHelper.pendingRequests).toHaveLength(1);
  const request = apiHelper.pendingRequests[0];
  expect(request).toEqual({
    method: "POST",
    body: {
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
    await apiHelper.resolve(Either.right({ data: Environment.filterable[0] }));
  });
  await act(async () => {
    await apiHelper.resolve(Either.right({ data: Project.filterable }));
  });
  expect(apiHelper.resolvedRequests).toHaveLength(3);
  expect(apiHelper.pendingRequests).toHaveLength(0);
  expect(
    await screen.findByRole("generic", { name: "Name-value" })
  ).toHaveTextContent("dev");
  expect(
    screen.queryByRole("textbox", { name: "Name-input" })
  ).not.toBeInTheDocument();
});

test("Given environment settings When canceling a name edit Then the backend request is not fired", async () => {
  const { component, apiHelper, selectedEnvironment } = setup();
  render(component);
  await userEvent.click(
    screen.getByRole("button", { name: "Name-toggle-edit" })
  );
  const textBox = await screen.findByRole("textbox", { name: "Name-input" });
  await userEvent.clear(textBox);
  await userEvent.type(textBox, "dev");
  await userEvent.click(
    screen.getByRole("button", { name: "Name-cancel-edit" })
  );
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
    await userEvent.click(
      screen.getByRole("button", { name: "Name-toggle-edit" })
    );
    const textBox = await screen.findByRole("textbox", { name: "Name-input" });
    await userEvent.clear(textBox);
    await userEvent.type(textBox, `dev{enter}`);
    expect(apiHelper.pendingRequests).toHaveLength(1);
    await act(async () => {
      await apiHelper.resolve(Maybe.some("Invalid environment name"));
    });
    await act(async () => {
      await apiHelper.resolve(
        Either.right({ data: Environment.filterable[0] })
      );
    });
    await act(async () => {
      await apiHelper.resolve(Either.right({ data: Project.filterable }));
    });
    expect(
      await screen.findByRole("generic", { name: "Name-error-message" })
    ).toBeVisible();

    expect(
      screen.queryByRole("textbox", { name: "Name-input" })
    ).not.toBeInTheDocument();

    // Closing the alert
    await userEvent.click(screen.getByRole("button", { name: elementName }));
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
  await userEvent.click(
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
  const { component, apiHelper, selectedEnvironment } = setup();
  render(component);
  const newRepository = "github.com/test-env";
  const newBranch = "dev";
  await userEvent.click(
    screen.getByRole("button", { name: "Repository Settings-toggle-edit" })
  );
  const branchTextBox = await screen.findByRole("textbox", {
    name: "repo_branch-input",
  });
  await userEvent.clear(branchTextBox);
  await userEvent.type(branchTextBox, newBranch);
  const urlTextBox = await screen.findByRole("textbox", {
    name: "repo_url-input",
  });
  await userEvent.clear(urlTextBox);
  await userEvent.type(urlTextBox, newRepository);
  await userEvent.click(
    screen.getByRole("button", { name: "Repository Settings-submit-edit" })
  );
  expect(apiHelper.pendingRequests).toHaveLength(1);
  const request = apiHelper.pendingRequests[0];
  expect(request).toEqual({
    method: "POST",
    body: {
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
    await apiHelper.resolve(Either.right({ data: Environment.filterable[0] }));
  });
  await act(async () => {
    await apiHelper.resolve(Either.right({ data: Project.filterable }));
  });
  expect(apiHelper.resolvedRequests).toHaveLength(3);
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

test("Given environment settings When canceling a repository edit Then the backend request is not fired", async () => {
  const { component, apiHelper, selectedEnvironment } = setup();
  render(component);
  await userEvent.click(
    screen.getByRole("button", { name: "Repository Settings-toggle-edit" })
  );
  const textBox = await screen.findByRole("textbox", {
    name: "repo_branch-input",
  });
  await userEvent.clear(textBox);
  await userEvent.type(textBox, "dev");
  await userEvent.click(
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
    await userEvent.click(
      screen.getByRole("button", { name: "Repository Settings-toggle-edit" })
    );
    const textBox = await screen.findByRole("textbox", {
      name: "repo_branch-input",
    });
    await userEvent.clear(textBox);
    await userEvent.type(textBox, `dev{enter}`);
    expect(apiHelper.pendingRequests).toHaveLength(1);
    await act(async () => {
      await apiHelper.resolve(Maybe.some("Invalid branch"));
    });
    await act(async () => {
      await apiHelper.resolve(
        Either.right({ data: Environment.filterable[0] })
      );
    });
    await act(async () => {
      await apiHelper.resolve(Either.right({ data: Project.filterable }));
    });
    expect(
      await screen.findByRole("generic", {
        name: "Repository Settings-error-message",
      })
    ).toBeVisible();

    expect(
      screen.queryByRole("textbox", { name: "repo_branch-input" })
    ).not.toBeInTheDocument();

    // Closing the alert
    await userEvent.click(screen.getByRole("button", { name: elementName }));
    expect(
      screen.queryByRole("generic", {
        name: "Repository Settings-error-message",
      })
    ).not.toBeInTheDocument();
  }
);

test("Given environment settings When clicking on the edit project button Then the select field is shown", async () => {
  const { component } = setup();
  render(component);
  expect(
    await screen.findByRole("generic", { name: "Project Name-value" })
  ).toBeVisible();
  await userEvent.click(
    screen.getByRole("button", { name: "Project Name-toggle-edit" })
  );
  expect(
    await screen.findByRole("textbox", { name: "Project Name-typeahead" })
  ).toBeVisible();

  expect(
    screen.queryByRole("generic", { name: "Project Name-value" })
  ).not.toBeInTheDocument();
});

test("Given environment settings When submitting the edited project name Then the backend request is fired", async () => {
  const { component, apiHelper, selectedEnvironment } = setup();
  render(component);
  await userEvent.click(
    screen.getByRole("button", { name: "Project Name-toggle-edit" })
  );
  const toggle = await screen.findByRole("button", {
    name: "Project Name-select-toggle",
  });
  await userEvent.click(toggle);
  await userEvent.click(screen.getByRole("option", { name: "project_name_b" }));
  await userEvent.click(
    screen.getByRole("button", { name: "Project Name-submit-edit" })
  );
  expect(apiHelper.pendingRequests).toHaveLength(1);
  const request = apiHelper.pendingRequests[0];
  expect(request).toEqual({
    method: "POST",
    body: {
      name: selectedEnvironment.name,
      project_id: "project_id_b",
    },
    url: `/api/v2/environment/${selectedEnvironment.id}`,
  });
  await act(async () => {
    await apiHelper.resolve(Maybe.none());
  });
  expect(apiHelper.resolvedRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests).toHaveLength(1);
  await act(async () => {
    await apiHelper.resolve(Either.right({ data: Environment.filterable[0] }));
  });
  await act(async () => {
    await apiHelper.resolve(Either.right({ data: Project.filterable }));
  });
  expect(apiHelper.resolvedRequests).toHaveLength(3);
  expect(apiHelper.pendingRequests).toHaveLength(0);
  expect(
    await screen.findByRole("generic", { name: "Project Name-value" })
  ).toHaveTextContent("project_name_b");
  expect(
    screen.queryByRole("textbox", { name: "Project Name-typeahead" })
  ).not.toBeInTheDocument();
});

test("Given environment settings When canceling a project name edit Then the backend request is not fired", async () => {
  const { component, apiHelper, selectedEnvironment } = setup();
  render(component);
  await userEvent.click(
    screen.getByRole("button", { name: "Project Name-toggle-edit" })
  );
  const toggle = await screen.findByRole("button", {
    name: "Project Name-select-toggle",
  });
  await userEvent.click(toggle);
  await userEvent.click(screen.getByRole("option", { name: "project_name_b" }));
  await userEvent.click(
    screen.getByRole("button", { name: "Project Name-cancel-edit" })
  );

  expect(apiHelper.pendingRequests).toHaveLength(0);
  expect(
    await screen.findByRole("generic", { name: "Project Name-value" })
  ).toHaveTextContent(selectedEnvironment.projectName);
  expect(
    screen.queryByRole("textbox", { name: "Project Name-typeahead" })
  ).not.toBeInTheDocument();
});

test.each`
  displayName                 | elementName
  ${"with the close button"}  | ${"Project Name-close-error"}
  ${"by starting a new edit"} | ${"Project Name-toggle-edit"}
`(
  "Given environment settings When a project name edit yields an error Then the error message is shown and can be closed $displayName",
  async ({ elementName }) => {
    const { component, apiHelper } = setup();
    render(component);
    await userEvent.click(
      screen.getByRole("button", { name: "Project Name-toggle-edit" })
    );
    const toggle = await screen.findByRole("button", {
      name: "Project Name-select-toggle",
    });
    await userEvent.click(toggle);
    await userEvent.click(
      screen.getByRole("option", { name: "project_name_b" })
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Project Name-submit-edit" })
    );
    expect(apiHelper.pendingRequests).toHaveLength(1);
    await act(async () => {
      await apiHelper.resolve(Maybe.some("Invalid project id"));
    });
    await act(async () => {
      await apiHelper.resolve(
        Either.right({ data: Environment.filterable[0] })
      );
    });
    await act(async () => {
      await apiHelper.resolve(Either.right({ data: Project.filterable }));
    });
    expect(
      await screen.findByRole("generic", { name: "Project Name-error-message" })
    ).toBeVisible();

    expect(
      screen.queryByRole("textbox", { name: "Project Name-typeahead" })
    ).not.toBeInTheDocument();

    // Closing the alert
    await userEvent.click(screen.getByRole("button", { name: elementName }));
    expect(
      screen.queryByRole("generic", { name: "Project Name-error-message" })
    ).not.toBeInTheDocument();
  }
);

test("Given environment settings When clicking on the edit description button Then the textarea field is shown", async () => {
  const { component } = setup();
  render(component);
  expect(
    await screen.findByRole("generic", { name: "Description-value" })
  ).toBeVisible();

  await userEvent.click(
    screen.getByRole("button", { name: "Description-toggle-edit" })
  );
  expect(
    await screen.findByRole("textbox", { name: "Description-input" })
  ).toBeVisible();

  expect(
    screen.queryByRole("generic", { name: "Description-value" })
  ).not.toBeInTheDocument();
});

test("Given environment settings When clicking on the edit icon button Then the image field is shown", async () => {
  const { component } = setup();
  render(component);
  expect(await screen.findByRole("img", { name: "Icon-value" })).toBeVisible();

  await userEvent.click(
    screen.getByRole("button", { name: "Icon-toggle-edit" })
  );
  expect(
    await screen.findByRole("textbox", { name: "Icon-input" })
  ).toBeVisible();

  expect(
    screen.queryByRole("img", { name: "Icon-value" })
  ).not.toBeInTheDocument();
});
