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
import * as routing from "@/UI/Routing/Utils";
import { Page } from "./Page";

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
    jest.clearAllMocks();
  });
  afterAll(() => {
    server.close();
    jest.clearAllMocks();
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
    const mockFn = jest.fn();
    jest.spyOn(routing, "useNavigateTo").mockReturnValue(mockFn);
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
    const mockFn = jest.fn();
    jest.spyOn(routing, "useNavigateTo").mockReturnValue(mockFn);

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

  test.only("Given CreateEnvironmentForm When a new project and valid environment are set and submit is clicked Then sends the correct requests", async () => {
    const mockFn = jest.fn();
    jest.spyOn(routing, "useNavigateTo").mockReturnValue(mockFn);

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
        console.log(body && body["name"] === "dev" && body["project_id"] === "proj-id-new")
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

    expect(
      await screen.findByRole("generic", { name: "Project Name-error-message" })
    ).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Project Name-close-error" }));

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
    expect(await screen.findByRole("generic", { name: "submit-error-message" })).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "submit-close-error" }));

    expect(screen.queryByRole("generic", { name: "submit-error-message" })).not.toBeInTheDocument();
  });

  test("Given CreateEnvironmentForm When an existing project, a valid environment and description are set and submit is clicked Then sends the correct requests", async () => {
    const mockFn = jest.fn();
    jest.spyOn(routing, "useNavigateTo").mockReturnValue(mockFn);

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
    const mockFn = jest.fn();
    jest.spyOn(routing, "useNavigateTo").mockReturnValue(mockFn);

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
});
