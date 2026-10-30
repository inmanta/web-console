import { act } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { configureAxe } from "jest-axe";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { RouteFactory, getFeatureRoutes, words } from "@inmanta/web-console-core";
import * as routing from "@inmanta/web-console-core/Routing/Utils";
import { environmentFeature } from "@inmanta/web-console-feature-environment";
import {
  Environment,
  MockedDependencyProvider,
  Project,
  stubRoute,
} from "@inmanta/web-console-test-utils";
import { TestMemoryRouter } from "@inmanta/web-console-test-utils/Utils/TestMemoryRouter";
import { testClient } from "@inmanta/web-console-test-utils/Utils/react-query-setup";
import { Page } from "./Page";

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

// After creating an environment, the form opens the service catalog (lsm) or the desired state
// (orchestration engine).
const linkedRoutes = [
  ...getFeatureRoutes([environmentFeature]),
  stubRoute("Catalog"),
  stubRoute("DesiredState"),
];

function setup(routes: RouteFactory[] = linkedRoutes) {
  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider features={[environmentFeature]} routes={routes}>
          <Page />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return { component };
}

describe("CreateEnvironmentForm", () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  beforeEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });
  afterAll(() => {
    server.close();
    vi.clearAllMocks();
  });

  test("Given CreateEnvironmentForm When project and environment are not set Then the submit button is disabled", async () => {
    server.use(
      http.get("/api/v2/project", () => {
        return HttpResponse.json({ data: Project.filterable });
      })
    );

    const { component } = setup();

    render(component);

    expect(await screen.findByRole("button", { name: "submit" })).toBeDisabled();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given CreateEnvironmentForm Then the repository and branch fields expose an example tooltip", async () => {
    server.use(
      http.get("/api/v2/project", () => {
        return HttpResponse.json({ data: Project.filterable });
      })
    );

    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("button", {
        name: `More info for ${words("createEnv.repository")} field`,
      })
    ).toBeVisible();
    expect(
      screen.getByRole("button", {
        name: `More info for ${words("createEnv.branch")} field`,
      })
    ).toBeVisible();
  });

  test("Given CreateEnvironmentForm When no projects are known, THEN cannot add empty project name", async () => {
    server.use(
      http.get("/api/v2/project", () => {
        return HttpResponse.json({ data: [] });
      })
    );
    const { component } = setup();

    render(component);

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
    const mockFn = vi.fn();
    vi.spyOn(routing, "useNavigateTo").mockReturnValue(mockFn);
    server.use(
      http.get("/api/v2/project", () => {
        return HttpResponse.json({ data: Project.filterable });
      }),
      http.put("/api/v2/environment", async ({ request }) => {
        const body = await request.json();

        if (body && body["name"] === "dev" && body["project_id"] === "1") {
          return HttpResponse.json({ data: Environment.a });
        }

        return HttpResponse.json({ message: "wrong params" }, { status: 400 });
      })
    );

    const { component } = setup();

    render(component);

    await userEvent.click(
      await screen.findByRole("combobox", {
        name: "Project Name-select-toggleFilterInput",
      })
    );

    await userEvent.click(await screen.findByRole("option", { name: Project.filterable[0].name }));

    const textBox = await screen.findByRole("textbox", { name: "Name-input" });

    await userEvent.clear(textBox);

    await userEvent.type(textBox, "dev{enter}");

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });

    await userEvent.click(await screen.findByRole("button", { name: "submit" }));

    expect(mockFn).toHaveBeenCalledWith("Catalog", undefined, "?env=environment_id_a");
  });

  test("Given CreateEnvironmentForm When an existing project, a valid environment and repository settings are set and submit is clicked Then sends the correct request", async () => {
    const mockFn = vi.fn();
    vi.spyOn(routing, "useNavigateTo").mockReturnValue(mockFn);

    server.use(
      http.get("/api/v2/project", () => {
        return HttpResponse.json({ data: Project.filterable });
      }),
      http.put("/api/v2/environment", async ({ request }) => {
        const body = await request.json();

        if (
          body &&
          body["name"] === "dev" &&
          body["project_id"] === "1" &&
          body["repository"] === "github.com/test-env" &&
          body["branch"] === "dev"
        ) {
          return HttpResponse.json({ data: Environment.a });
        }

        return HttpResponse.json({ message: "wrong params" }, { status: 400 });
      })
    );

    const { component } = setup();

    render(component);

    await userEvent.click(
      await screen.findByRole("combobox", {
        name: "Project Name-select-toggleFilterInput",
      })
    );

    await userEvent.click(await screen.findByRole("option", { name: Project.filterable[0].name }));

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
    expect(mockFn).toHaveBeenCalledWith("Catalog", undefined, "?env=environment_id_a");
  });

  test("Given CreateEnvironmentForm When a new project and valid environment are set and submit is clicked Then sends the correct requests", async () => {
    const mockFn = vi.fn();
    vi.spyOn(routing, "useNavigateTo").mockReturnValue(mockFn);

    const data = Project.filterable;
    server.use(
      http.get("/api/v2/project", () => {
        return HttpResponse.json({ data: Project.filterable });
      }),

      http.put("/api/v2/project", async ({ request }) => {
        const body = await request.json();
        const newProject = { name: "new-project", id: "proj-id-new", environments: [] };
        data.push(newProject);

        if (body && body["name"] === "new-project") {
          return HttpResponse.json({ data: newProject });
        }

        return HttpResponse.json({ message: "wrong params" }, { status: 400 });
      }),
      http.put("/api/v2/environment", async ({ request }) => {
        const body = await request.json();

        if (body && body["name"] === "dev" && body["project_id"] === "proj-id-new") {
          return HttpResponse.json({ data: Environment.a });
        }

        return HttpResponse.json({ message: "wrong params" }, { status: 400 });
      })
    );

    const { component } = setup();

    await act(async () => {
      render(component);
    });

    await userEvent.click(
      await screen.findByRole("combobox", {
        name: "Project Name-select-toggleFilterInput",
      })
    );

    await userEvent.type(
      await screen.findByRole("combobox", {
        name: "Project Name-select-toggleFilterInput",
      }),
      "new-project"
    );

    await userEvent.click(await screen.findByRole("option", { name: 'Create "new-project"' }));

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });

    const textBox = await screen.findByRole("textbox", { name: "Name-input" });

    await userEvent.clear(textBox);
    await userEvent.type(textBox, "dev{enter}");

    expect(await screen.findByRole("button", { name: "submit" })).toBeEnabled();
    await userEvent.click(await screen.findByRole("button", { name: "submit" }));

    expect(mockFn).toHaveBeenCalledWith("Catalog", undefined, "?env=environment_id_a");
  });

  test("Given CreateEnvironmentForm When a new project is created Then submit stays disabled until the refetched projects include it", async () => {
    const newProject = { name: "refetched-project", id: "proj-id-refetched", environments: [] };
    let releaseProjectsRefetch: () => void = () => {};
    const projectsRefetchReleased = new Promise<void>((resolve) => {
      releaseProjectsRefetch = resolve;
    });
    let projectsRequestCount = 0;

    server.use(
      http.get("/api/v2/project", async () => {
        projectsRequestCount += 1;

        if (projectsRequestCount === 1) {
          return HttpResponse.json({ data: Project.filterable });
        }
        await projectsRefetchReleased;

        return HttpResponse.json({ data: [...Project.filterable, newProject] });
      }),
      http.put("/api/v2/project", () => HttpResponse.json({ data: newProject }))
    );

    const { component } = setup();

    render(component);

    const projectInput = await screen.findByRole("combobox", {
      name: "Project Name-select-toggleFilterInput",
    });

    await userEvent.click(projectInput);
    await userEvent.type(projectInput, newProject.name);
    await userEvent.click(
      await screen.findByRole("option", { name: `Create "${newProject.name}"` })
    );
    await userEvent.type(await screen.findByRole("textbox", { name: "Name-input" }), "dev");

    await waitFor(() => expect(projectsRequestCount).toBe(2));
    expect(screen.getByRole("button", { name: "submit" })).toBeDisabled();

    releaseProjectsRefetch();

    await waitFor(() => expect(screen.getByRole("button", { name: "submit" })).toBeEnabled());
  });

  test("Given CreateEnvironmentForm When creating a new project is not successful Then shows error message", async () => {
    server.use(
      http.get("/api/v2/project", () => {
        return HttpResponse.json({ data: Project.filterable });
      }),

      http.put("/api/v2/project", async () => {
        return HttpResponse.json(
          { message: "Unexpected error while trying to create new project" },
          { status: 500 }
        );
      })
    );
    const { component } = setup();

    render(component);

    await userEvent.click(
      await screen.findByRole("combobox", {
        name: "Project Name-select-toggleFilterInput",
      })
    );

    await userEvent.type(
      await screen.findByRole("combobox", {
        name: "Project Name-select-toggleFilterInput",
      }),
      "new-project2"
    );

    await userEvent.click(screen.getByText('Create "new-project2"'));

    expect(await screen.findByTestId("Project Name-error-message")).toBeVisible();

    await userEvent.click(screen.getByTestId("Project Name-error-message-close"));

    expect(
      screen.queryByRole("generic", { name: "Project Name-error-message" })
    ).not.toBeInTheDocument();
  });

  test(`Given CreateEnvironmentForm When an existing project and invalid environment are set and submit is clicked 
      Then shows the error message`, async () => {
    server.use(
      http.get("/api/v2/project", () => {
        return HttpResponse.json({ data: Project.filterable });
      }),

      http.put("/api/v2/environment", async () => {
        return HttpResponse.json({ message: "Environment already exists" }, { status: 400 });
      })
    );

    const { component } = setup();

    render(component);

    // Input data
    await userEvent.click(
      await screen.findByRole("combobox", {
        name: "Project Name-select-toggleFilterInput",
      })
    );

    await userEvent.click(await screen.findByRole("option", { name: Project.filterable[0].name }));

    const textBox = await screen.findByRole("textbox", { name: "Name-input" });

    await userEvent.clear(textBox);
    await userEvent.type(textBox, "test-env1{enter}");

    // Submit request
    await userEvent.click(await screen.findByRole("button", { name: "submit" }));

    // Alert is visible and can be closed
    expect(await screen.findByTestId("submit-error-message")).toBeVisible();

    await userEvent.click(screen.getByTestId("submit-error-message-close"));

    expect(screen.queryByTestId("submit-error-message")).not.toBeInTheDocument();
  });

  test("Given CreateEnvironmentForm When an existing project, a valid environment and description are set and submit is clicked Then sends the correct requests", async () => {
    const mockFn = vi.fn();
    vi.spyOn(routing, "useNavigateTo").mockReturnValue(mockFn);

    server.use(
      http.get("/api/v2/project", () => {
        return HttpResponse.json({ data: Project.filterable });
      }),

      http.put("/api/v2/environment", async ({ request }) => {
        const body = await request.json();

        if (
          body &&
          body["name"] === "dev" &&
          body["project_id"] === "1" &&
          body["description"] === "description text"
        ) {
          return HttpResponse.json({ data: Environment.a });
        }

        return HttpResponse.json({ message: "wrong params" }, { status: 400 });
      })
    );
    const { component } = setup();

    render(component);

    await userEvent.click(
      await screen.findByRole("combobox", {
        name: "Project Name-select-toggleFilterInput",
      })
    );

    await userEvent.click(await screen.findByRole("option", { name: Project.filterable[0].name }));

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

    expect(mockFn).toHaveBeenCalledWith("Catalog", undefined, "?env=environment_id_a");
  });

  test("Given CreateEnvironmentForm When an existing project, a valid environment and repository settings are set then removed and submit is clicked Then sends the correct request", async () => {
    const mockFn = vi.fn();
    vi.spyOn(routing, "useNavigateTo").mockReturnValue(mockFn);

    server.use(
      http.get("/api/v2/project", () => {
        return HttpResponse.json({ data: Project.filterable });
      }),

      http.put("/api/v2/environment", async ({ request }) => {
        const body = await request.json();

        if (body && body["name"] === "dev" && body["project_id"] === "1") {
          return HttpResponse.json({ data: Environment.a });
        }

        return HttpResponse.json({ message: "wrong params" }, { status: 400 });
      })
    );

    const { component } = setup();

    render(component);

    await userEvent.click(
      await screen.findByRole("combobox", {
        name: "Project Name-select-toggleFilterInput",
      })
    );

    await userEvent.click(await screen.findByRole("option", { name: Project.filterable[0].name }));

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

    expect(mockFn).toHaveBeenCalledWith("Catalog", undefined, "?env=environment_id_a");
  });

  /**
   * Creates environment "dev" in the first project, and returns the mocked navigateTo it called.
   */
  const createEnvironmentWith = async (routes: RouteFactory[]) => {
    const mockFn = vi.fn();
    vi.spyOn(routing, "useNavigateTo").mockReturnValue(mockFn);
    server.use(
      http.get("/api/v2/project", () => {
        return HttpResponse.json({ data: Project.filterable });
      }),
      http.put("/api/v2/environment", () => {
        return HttpResponse.json({ data: Environment.a });
      })
    );

    const { component } = setup(routes);

    render(component);

    await userEvent.click(
      await screen.findByRole("combobox", {
        name: "Project Name-select-toggleFilterInput",
      })
    );
    await userEvent.click(await screen.findByRole("option", { name: Project.filterable[0].name }));

    const textBox = await screen.findByRole("textbox", { name: "Name-input" });

    await userEvent.clear(textBox);
    await userEvent.type(textBox, "dev{enter}");
    await userEvent.click(await screen.findByRole("button", { name: "submit" }));

    return mockFn;
  };

  test("Given CreateEnvironmentForm When the app has the desired state but not the catalog Then it opens the new environment's desired state", async () => {
    const navigateTo = await createEnvironmentWith([
      ...getFeatureRoutes([environmentFeature]),
      stubRoute("DesiredState"),
    ]);

    expect(navigateTo).toHaveBeenCalledWith("DesiredState", undefined, "?env=environment_id_a");
  });

  test("Given CreateEnvironmentForm When the app has neither the catalog nor the desired state Then it opens the new environment's dashboard", async () => {
    const navigateTo = await createEnvironmentWith(getFeatureRoutes([environmentFeature]));

    expect(navigateTo).toHaveBeenCalledWith("Dashboard", undefined, "?env=environment_id_a");
  });
});
