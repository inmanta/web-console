import { act } from "react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { HttpResponse, graphql, http } from "msw";
import { setupServer } from "msw/node";
import { Root } from "@/UI/Root/Root";
import { createRootRoutes } from "@/UI/Root/RootRoutes";
import { features } from "@/appFeatures";
import { defaultAuthContext } from "@inmanta/web-console-core/Auth/AuthContext";
import { EnvironmentPreviewResponse } from "@inmanta/web-console-core/Queries/Slices/Environment";
import {
  Environment,
  EnvironmentSettings,
  MockedDependencyProvider,
  Project,
  ServerStatus,
} from "@inmanta/web-console-test-utils";

// The header only shows once the whole app has rendered, which can take over the default 1 s on
// slow CI runners. findBy still resolves as soon as the header is there.
const appHeaderTimeout = { timeout: 5000 };

vi.spyOn(defaultAuthContext, "getToken").mockReturnValue("mocked_token");
vi.spyOn(defaultAuthContext, "getUser").mockReturnValue("mocked_user");
function setup() {
  const queryClient = new QueryClient();

  const router = createMemoryRouter(
    [
      {
        element: (
          <MockedDependencyProvider features={features}>
            <Root />
          </MockedDependencyProvider>
        ),
        children: createRootRoutes("", features),
      },
    ],
    { initialEntries: ["/"] }
  );

  const component = (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );

  return {
    component,
  };
}

describe("Root", () => {
  const queryBase = graphql.link("/api/v2/graphql");
  const server = setupServer(
    http.get("/api/v1/serverstatus", async () => {
      return HttpResponse.json({ data: ServerStatus.withLsm });
    }),
    http.get("/api/v2/project", async () => {
      return HttpResponse.json({ data: Project.list });
    }),
    queryBase.operation(() => {
      return HttpResponse.json<{ data: EnvironmentPreviewResponse }>({
        data: {
          data: {
            environments: {
              edges: [
                {
                  node: {
                    id: "1",
                    name: "Environment 1",
                    isCompiling: false,
                    isExpertMode: false,
                    halted: false,
                  },
                },
              ],
            },
          },
          errors: [],
          extensions: {},
        },
      });
    }),
    http.get("/api/v2/environment", async () => {
      return HttpResponse.json({ data: Environment.filterable });
    }),
    http.get("/api/v2/environment_settings", async () => {
      return HttpResponse.json({ data: EnvironmentSettings.base });
    })
  );

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => {
    server.close();
    vi.clearAllMocks();
  });

  test("GIVEN the app THEN the app should be accessible", async () => {
    const { component } = setup();

    render(component);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN the app THEN the navigation toggle button should be visible", async () => {
    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("button", { name: "Main Navigation" }, appHeaderTimeout)
    ).toBeVisible();
  });

  test("GIVEN the app THEN the documentation link should be visible", async () => {
    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("button", { name: "documentation link" }, appHeaderTimeout)
    ).toBeVisible();
  });

  test("GIVEN the app THEN the API actions button should be visible", async () => {
    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("button", { name: "Developer Tools" }, appHeaderTimeout)
    ).toBeVisible();
  });
});
