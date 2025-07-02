import React, { act } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { defaultAuthContext } from "@/Data/Auth/AuthContext";
import {
  Environment,
  EnvironmentSettings,
  MockedDependencyProvider,
  Project,
  ServerStatus,
} from "@/Test";
import { TestMemoryRouter } from "../Routing/TestMemoryRouter";
import { Root } from "./Root";

jest.spyOn(defaultAuthContext, "getToken").mockReturnValue("mocked_token");
jest.spyOn(defaultAuthContext, "getUser").mockReturnValue("mocked_user");
function setup() {
  const queryClient = new QueryClient();

  const component = (
    <QueryClientProvider client={queryClient}>
      <TestMemoryRouter initialEntries={["/"]}>
        <MockedDependencyProvider>
          <Root />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return {
    component,
  };
}

expect.extend(toHaveNoViolations);

describe("Root", () => {
  const server = setupServer(
    http.get("/api/v1/serverstatus", async () => {
      return HttpResponse.json({ data: ServerStatus.withLsm });
    }),
    http.get("/api/v2/project", async () => {
      return HttpResponse.json({ data: Project.list });
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
    jest.clearAllMocks();
  });

  test("GIVEN the app THEN the app should be accessible", async () => {
    fetchMock.mockResponse(JSON.stringify({}));
    const { component } = setup();

    render(component);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN the app THEN the navigation toggle button should be visible", async () => {
    fetchMock.mockResponse(JSON.stringify({}));
    const { component } = setup();

    render(component);

    expect(await screen.findByRole("button", { name: "Main Navigation" })).toBeVisible();
  });

  test("GIVEN the app THEN the documentation link should be visible", async () => {
    fetchMock.mockResponse(JSON.stringify({}));
    const { component } = setup();

    render(component);

    expect(await screen.findByRole("button", { name: "documentation link" })).toBeVisible();
  });
});
