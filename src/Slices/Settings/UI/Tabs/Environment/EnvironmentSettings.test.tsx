import React, { act } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { Environment, MockedDependencyProvider, Project } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { EnvironmentSettings } from "./EnvironmentSettings";

expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

function setup() {
  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider>
          <EnvironmentSettings environment={Environment.env} projects={Project.list} />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return { component };
}

describe("EnvironmentSettings", () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("Given environment settings When clicking on the edit name button Then the input field is shown", async () => {
    const { component } = setup();

    render(component);
    expect(await screen.findByTestId("Name-value")).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Name-toggle-edit" }));

    expect(await screen.findByRole("textbox", { name: "Name-input" })).toBeVisible();
    expect(screen.queryByTestId("Name-value")).not.toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given environment settings When submitting the edited name Then the backend request is fired", async () => {
    server.use(
      http.post("/api/v2/environment/c85c0a64-ed45-4cba-bdc5-703f65a225f7", async ({ request }) => {
        const body = await request.json();
        if (body && body["name"] === "dev") {
          return HttpResponse.json();
        }
        return HttpResponse.json({ message: "Invalid environment name" }, { status: 400 });
      })
    );
    const { component } = setup();

    render(component);

    await userEvent.click(screen.getByRole("button", { name: "Name-toggle-edit" }));

    const textBox = await screen.findByRole("textbox", { name: "Name-input" });

    await userEvent.clear(textBox);

    await userEvent.type(textBox, "dev{enter}");

    await waitFor(() => {
      expect(screen.queryByTestId("environment-settings-error")).toBeNull();
    });

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given environment settings When canceling a name edit Then the backend request is not fired", async () => {
    server.use(
      http.post("/api/v2/environment/c85c0a64-ed45-4cba-bdc5-703f65a225f7", async () => {
        return HttpResponse.json({ message: "Invalid call" }, { status: 400 });
      })
    );
    const { component } = setup();

    render(component);

    await userEvent.click(screen.getByRole("button", { name: "Name-toggle-edit" }));

    const textBox = await screen.findByRole("textbox", { name: "Name-input" });

    await userEvent.clear(textBox);

    await userEvent.type(textBox, "dev");

    await userEvent.click(screen.getByRole("button", { name: "Name-cancel-edit" }));

    // The field is shown with the original value
    expect(await screen.findByTestId("Name-value")).toHaveTextContent("env");

    expect(screen.queryByRole("textbox", { name: "Name-input" })).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId("environment-settings-error")).toBeNull();
    });

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test.each`
    displayName                 | elementName
    ${"with the close button"}  | ${"environment-settings-error-close"}
    ${"by starting a new edit"} | ${"Name-toggle-edit"}
  `(
    "Given environment settings When a name edit yields an error Then the error message is shown and can be closed $displayName",
    async ({ elementName }) => {
      server.use(
        http.post("/api/v2/environment/c85c0a64-ed45-4cba-bdc5-703f65a225f7", async () => {
          return HttpResponse.json({ message: "Invalid environment name" }, { status: 400 });
        })
      );
      const { component } = setup();

      render(component);

      await userEvent.click(screen.getByRole("button", { name: "Name-toggle-edit" }));

      const textBox = await screen.findByRole("textbox", { name: "Name-input" });

      await userEvent.clear(textBox);

      await userEvent.type(textBox, "dev{enter}");

      expect(await screen.findByTestId("environment-settings-error")).toBeVisible();

      expect(screen.queryByRole("textbox", { name: "Name-input" })).not.toBeInTheDocument();

      // Closing the alert
      await userEvent.click(screen.getByRole("button", { name: elementName }));

      expect(screen.queryByTestId("environment-settings-error")).not.toBeInTheDocument();

      await act(async () => {
        const results = await axe(document.body);

        expect(results).toHaveNoViolations();
      });
    }
  );

  test("Given environment settings When clicking on the edit repository settings button Then the input fields are shown", async () => {
    const { component } = setup();

    render(component);

    expect(await screen.findByTestId("repo_branch-value")).toBeVisible();
    expect(await screen.findByTestId("repo_url-value")).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Repository Settings-toggle-edit" }));

    expect(await screen.findByRole("textbox", { name: "repo_branch-input" })).toBeVisible();
    expect(await screen.findByRole("textbox", { name: "repo_url-input" })).toBeVisible();
    expect(screen.queryByTestId("repo_branch-value")).not.toBeInTheDocument();
    expect(screen.queryByTestId("repo_url-value")).not.toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given environment settings When submitting the edited repository settings Then the backend request is fired", async () => {
    const newRepository = "github.com/test-env";
    const newBranch = "dev";

    server.use(
      http.post("/api/v2/environment/c85c0a64-ed45-4cba-bdc5-703f65a225f7", async ({ request }) => {
        const body = await request.json();
        if (body && body["repository"] === newRepository && body["branch"] === newBranch) {
          return HttpResponse.json();
        }
        return HttpResponse.json({ message: "Invalid environment name" }, { status: 400 });
      })
    );
    const { component } = setup();

    render(component);

    await userEvent.click(screen.getByRole("button", { name: "Repository Settings-toggle-edit" }));

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

    await userEvent.click(screen.getByRole("button", { name: "Repository Settings-submit-edit" }));

    await waitFor(() => {
      expect(screen.queryByTestId("environment-settings-error")).toBeNull();
    });

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given environment settings When canceling a repository edit Then the backend request is not fired", async () => {
    server.use(
      http.post("/api/v2/environment/c85c0a64-ed45-4cba-bdc5-703f65a225f7", async () => {
        return HttpResponse.json({ message: "Invalid call" }, { status: 400 });
      })
    );

    const { component } = setup();

    render(component);

    await userEvent.click(screen.getByRole("button", { name: "Repository Settings-toggle-edit" }));

    const textBox = await screen.findByRole("textbox", {
      name: "repo_branch-input",
    });

    await userEvent.clear(textBox);

    await userEvent.type(textBox, "dev");

    await userEvent.click(screen.getByRole("button", { name: "Repository Settings-cancel-edit" }));

    // The field is shown with the original value
    expect(screen.queryByRole("textbox", { name: "repo_branch-input" })).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "repo_url-input" })).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId("environment-settings-error")).toBeNull();
    });

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test.each`
    displayName                 | elementName
    ${"with the close button"}  | ${"environment-settings-error-close"}
    ${"by starting a new edit"} | ${"Repository Settings-toggle-edit"}
  `(
    "Given environment settings When a repo edit yields an error Then the error message is shown and can be closed $displayName",
    async ({ elementName }) => {
      server.use(
        http.post("/api/v2/environment/c85c0a64-ed45-4cba-bdc5-703f65a225f7", async () => {
          return HttpResponse.json({ message: "Invalid branch" }, { status: 400 });
        })
      );
      const { component } = setup();

      render(component);

      await userEvent.click(
        screen.getByRole("button", { name: "Repository Settings-toggle-edit" })
      );

      const textBox = await screen.findByRole("textbox", {
        name: "repo_branch-input",
      });

      await userEvent.clear(textBox);

      await userEvent.type(textBox, "dev{enter}");

      expect(await screen.findByTestId("environment-settings-error")).toBeVisible();

      expect(screen.queryByRole("textbox", { name: "repo_branch-input" })).not.toBeInTheDocument();

      // Closing the alert
      await userEvent.click(screen.getByRole("button", { name: elementName }));

      expect(screen.queryByTestId("environment-settings-error")).not.toBeInTheDocument();

      await act(async () => {
        const results = await axe(document.body);

        expect(results).toHaveNoViolations();
      });
    }
  );

  test("Given environment settings When clicking on the edit project button Then the select field is shown", async () => {
    const { component } = setup();

    render(component);

    expect(await screen.findByTestId("Project Name-value")).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Project Name-toggle-edit" }));

    expect(
      await screen.findByRole("combobox", {
        name: "Project Name-select-toggleFilterInput",
      })
    ).toBeVisible();

    expect(screen.queryByTestId("Project Name-value")).not.toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given environment settings When submitting the edited project name Then the backend request is fired", async () => {
    server.use(
      http.post("/api/v2/environment/c85c0a64-ed45-4cba-bdc5-703f65a225f7", async ({ request }) => {
        const body = await request.json();
        if (body && body["project_id"] === "project_id_b") {
          return HttpResponse.json();
        }
        return HttpResponse.json({ message: "Invalid environment name" }, { status: 400 });
      })
    );
    const { component } = setup();

    render(component);

    await userEvent.click(screen.getByRole("button", { name: "Project Name-toggle-edit" }));

    const toggle = await screen.findByRole("combobox", {
      name: "Project Name-select-toggleFilterInput",
    });

    await userEvent.click(toggle);

    await userEvent.click(screen.getByRole("option", { name: "project_name_b" }));

    await userEvent.click(screen.getByRole("button", { name: "Project Name-submit-edit" }));

    expect(await screen.findByTestId("Project Name-value")).toHaveTextContent("project_name_b");
    expect(
      screen.queryByRole("textbox", { name: "Project Name-typeahead" })
    ).not.toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given environment settings When canceling a project name edit Then the backend request is not fired", async () => {
    const { component } = setup();

    render(component);

    await userEvent.click(screen.getByRole("button", { name: "Project Name-toggle-edit" }));

    const toggle = await screen.findByRole("combobox", {
      name: "Project Name-select-toggleFilterInput",
    });

    await userEvent.click(toggle);

    await userEvent.click(screen.getByRole("option", { name: "project_name_b" }));

    await userEvent.click(screen.getByRole("button", { name: "Project Name-cancel-edit" }));

    expect(await screen.findByTestId("Project Name-value")).toHaveTextContent("project_name_b");
    expect(
      screen.queryByRole("textbox", { name: "Project Name-typeahead" })
    ).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId("environment-settings-error")).toBeNull();
    });

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test.each`
    displayName                 | elementName
    ${"with the close button"}  | ${"environment-settings-error-close"}
    ${"by starting a new edit"} | ${"Project Name-toggle-edit"}
  `(
    "Given environment settings When a project name edit yields an error Then the error message is shown and can be closed $displayName",
    async ({ elementName }) => {
      server.use(
        http.post("/api/v2/environment/c85c0a64-ed45-4cba-bdc5-703f65a225f7", async () => {
          return HttpResponse.json({ message: "Invalid project id" }, { status: 400 });
        })
      );
      const { component } = setup();

      render(component);

      await userEvent.click(screen.getByRole("button", { name: "Project Name-toggle-edit" }));

      const toggle = await screen.findByRole("combobox", {
        name: "Project Name-select-toggleFilterInput",
      });

      await userEvent.click(toggle);

      await userEvent.click(screen.getByRole("option", { name: "project_name_b" }));

      await userEvent.click(screen.getByRole("button", { name: "Project Name-submit-edit" }));
      expect(await screen.findByTestId("environment-settings-error")).toBeVisible();

      expect(
        screen.queryByRole("textbox", { name: "Project Name-typeahead" })
      ).not.toBeInTheDocument();

      // Closing the alert
      await userEvent.click(screen.getByRole("button", { name: elementName }));

      expect(screen.queryByTestId("environment-settings-error")).not.toBeInTheDocument();

      await act(async () => {
        const results = await axe(document.body);

        expect(results).toHaveNoViolations();
      });
    }
  );

  test("Given environment settings When clicking on the edit description button Then the textarea field is shown", async () => {
    const { component } = setup();

    render(component);
    expect(await screen.findByTestId("Description-value")).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Description-toggle-edit" }));

    expect(await screen.findByRole("textbox", { name: "Description-input" })).toBeVisible();

    expect(screen.queryByTestId("Description-value")).not.toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given environment settings When clicking on the edit icon button Then the image field is shown", async () => {
    const { component } = setup();

    render(component);
    expect(await screen.findByTestId("Icon-value")).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Icon-toggle-edit" }));

    expect(await screen.findByRole("textbox", { name: "Icon-input" })).toBeVisible();

    expect(screen.queryByTestId("Icon-value")).not.toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });
});
