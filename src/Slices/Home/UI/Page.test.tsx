import { act } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { configureAxe } from "jest-axe";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { Environment, MockedDependencyProvider, Project } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { Page } from "./Page";

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

describe("Home", () => {
  const server = setupServer();

  beforeAll(() => {
    server.listen();
  });

  beforeEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  test("Home view shows failed table", async () => {
    server.use(
      http.get("/api/v2/project", () => {
        return HttpResponse.json(
          {
            message: "something went wrong",
          },
          { status: 500 }
        );
      }),
      http.get("/api/v2/environment", () => {
        return HttpResponse.json({ data: Environment.filterable });
      })
    );
    const { component } = setup();

    render(component);

    expect(await screen.findByRole("region", { name: "Overview-Loading" })).toBeInTheDocument();

    expect(await screen.findByRole("region", { name: "Overview-Failed" })).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Home View shows success table", async () => {
    server.use(
      http.get("/api/v2/project", () => {
        return HttpResponse.json({ data: Project.filterable });
      }),
      http.get("/api/v2/environment", () => {
        return HttpResponse.json({ data: Environment.filterable });
      })
    );
    const { component } = setup();

    render(component);

    expect(await screen.findByRole("region", { name: "Overview-Loading" })).toBeInTheDocument();

    expect(await screen.findByRole("generic", { name: "Overview-Success" })).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });
});
