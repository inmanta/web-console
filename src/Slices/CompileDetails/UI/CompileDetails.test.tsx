import React, { act } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { getStoreInstance } from "@/Data";
import { dependencies } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { UrlManagerImpl } from "@/UI/Utils";
import * as Mock from "@S/CompileDetails/Core/Mock";
import { CompileDetails } from "./CompileDetails";

expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const store = getStoreInstance();
  const urlManager = new UrlManagerImpl(dependencies.featureManager, "");

  const component = (
    <QueryClientProvider client={queryClient}>
      <TestMemoryRouter>
        <DependencyProvider dependencies={{ ...dependencies, urlManager }}>
          <StoreProvider store={store}>
            <CompileDetails id="123" />
          </StoreProvider>
        </DependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return { component };
}
const server = setupServer();

describe("CompileDetails", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("CompileDetailsView shows failed view", async () => {
    server.use(
      http.get("api/v2/compilereport/123", () => {
        return HttpResponse.json(
          {
            message: "error",
          },
          {
            status: 500,
          }
        );
      })
    );
    const { component } = setup();

    render(component);

    expect(screen.getByRole("region", { name: "CompileDetailsView-Loading" })).toBeInTheDocument();

    expect(
      await screen.findByRole("region", { name: "CompileDetailsView-Error" })
    ).toBeInTheDocument();
  });

  test("CompileDetailsView shows completed table with success: true", async () => {
    server.use(
      http.get("api/v2/compilereport/123", () => {
        return HttpResponse.json({ data: Mock.data });
      })
    );
    const { component } = setup();

    await render(component);

    expect(
      await screen.findByRole("region", { name: "CompileDetailsView-Loading" })
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("generic", {
        name: "CompileDetailsView-Success",
      })
    ).toBeInTheDocument();
    expect(await screen.findAllByLabelText("done-state")).toHaveLength(3);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("CompileDetailsView shows completed table with success: false, error indication should appear", async () => {
    server.use(
      http.get("api/v2/compilereport/123", () => {
        return HttpResponse.json({ data: Mock.DataFailed });
      })
    );
    const { component } = setup();

    await render(component);

    expect(
      await screen.findByRole("region", { name: "CompileDetailsView-Loading" })
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("generic", {
        name: "CompileDetailsView-Success",
      })
    ).toBeInTheDocument();

    expect(await screen.findByLabelText("error-state")).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });
});
