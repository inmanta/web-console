import React, { act } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { configureAxe } from "jest-axe";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { words } from "@inmanta/web-console-core";
import { MockedDependencyProvider, EnvironmentDetails } from "@inmanta/web-console-test-utils";
import { TestMemoryRouter } from "@inmanta/web-console-test-utils/Utils/TestMemoryRouter";
import { testClient } from "@inmanta/web-console-test-utils/Utils/react-query-setup";
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

describe("Dashboard Page", () => {
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

  test("Shows an error view when the environment details fetch fails", async () => {
    server.use(
      http.get("/api/v2/environment/c85c0a64-ed45-4cba-bdc5-703f65a225f7", () => {
        return HttpResponse.json(
          {
            message: "something went wrong",
          },
          { status: 500 }
        );
      })
    );
    const { component } = setup();

    render(component);

    expect(await screen.findByRole("region", { name: "Dashboard-Loading" })).toBeInTheDocument();

    expect(await screen.findByRole("region", { name: "Dashboard-Failed" })).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Shows the dashboard once the environment details fetch succeeds", async () => {
    server.use(
      http.get("/api/v2/environment/c85c0a64-ed45-4cba-bdc5-703f65a225f7?", () => {
        return HttpResponse.json({
          data: EnvironmentDetails.a,
        });
      })
    );
    const { component } = setup();

    render(component);

    expect(await screen.findByRole("region", { name: "Dashboard-Loading" })).toBeInTheDocument();

    expect(await screen.findByText(words("dashboard.title"))).toBeInTheDocument();
  });
});
