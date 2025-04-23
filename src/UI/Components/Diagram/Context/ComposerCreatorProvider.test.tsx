import React from "react";
import { Route, Routes, useLocation } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { RemoteData } from "@/Core";
import { getStoreInstance } from "@/Data";
import { dependencies } from "@/Test";
import { DependencyProvider, EnvironmentHandlerImpl, PrimaryRouteManager } from "@/UI";
import "@testing-library/jest-dom";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { childModel, containerModel, parentModel } from "../Mocks";
import { defineObjectsForJointJS } from "../testSetup";
import { ComposerCreatorProvider } from "./ComposerCreatorProvider";

const setup = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const store = getStoreInstance();
  const environmentHandler = EnvironmentHandlerImpl(useLocation, PrimaryRouteManager(""));

  store.dispatch.environment.setEnvironments(
    RemoteData.success([
      {
        id: "aaa",
        name: "env-a",
        project_id: "ppp",
        repo_branch: "branch",
        repo_url: "repo",
        projectName: "project",
        halted: false,
        settings: {
          enable_lsm_expert_mode: false,
        },
      },
    ])
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TestMemoryRouter initialEntries={["/lsm/catalog/child-service/inventory/add?env=aaa"]}>
        <StoreProvider store={store}>
          <DependencyProvider dependencies={{ ...dependencies, environmentHandler }}>
            <Routes>
              <Route
                path="/lsm/catalog/child-service/inventory/add"
                element={<ComposerCreatorProvider serviceName={"child-service"} />}
              />
              <Route
                path="/lsm/catalog/child-service/inventory"
                element={<div data-testid="inventory-page" />}
              />
              <Route path="/" element={<div data-testid="root-page" />} />
            </Routes>
          </DependencyProvider>
        </StoreProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );
};
const server = setupServer(
  http.get("/lsm/v1/service_catalog", async () => {
    return HttpResponse.json({
      data: [parentModel, childModel, containerModel],
    });
  }),
  http.get("/lsm/v1/service_inventory/parent-service", async () => {
    return HttpResponse.json({
      data: [],
    });
  })
);

describe("ComposerCreatorProvider", () => {
  beforeAll(() => {
    defineObjectsForJointJS();
    server.listen();
  });
  afterEach(() => {
    server.resetHandlers();
  });
  afterAll(() => {
    server.close();
  });

  it("if there is error when fetching service models the error view is shown", async () => {
    server.use(
      http.get("/lsm/v1/service_catalog", async () => {
        return HttpResponse.json({ message: "Something went wrong" }, { status: 400 });
      })
    );
    render(setup());

    expect(
      await screen.findByRole("region", {
        name: "ComposerCreatorProvider-Loading",
      })
    ).toBeInTheDocument();

    expect(await screen.findByTestId("ErrorView")).toBeInTheDocument();

    expect(
      await screen.findByRole("region", {
        name: "ComposerCreatorProvider-ServiceModelsQuery_failed",
      })
    ).toBeInTheDocument();

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
  });

  it("if there is error when related inventories the error view is shown", async () => {
    render(setup());
    server.use(
      http.get("/lsm/v1/service_inventory/parent-service", async () => {
        return HttpResponse.json({ message: "Something went wrong" }, { status: 400 });
      })
    );
    expect(
      await screen.findByRole("region", {
        name: "ComposerCreatorProvider-Loading",
      })
    ).toBeInTheDocument();

    expect(await screen.findByTestId("ErrorView")).toBeInTheDocument();

    expect(
      await screen.findByRole("region", {
        name: "ComposerCreatorProvider-RelatedInventoriesQuery_failed",
      })
    ).toBeInTheDocument();

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
  });

  it("if there is error no main service model the error view is shown", async () => {
    server.use(
      http.get("/lsm/v1/service_catalog", async () => {
        return HttpResponse.json({
          data: [parentModel, containerModel],
        });
      })
    );

    render(setup());

    expect(
      await screen.findByRole("region", {
        name: "ComposerCreatorProvider-Loading",
      })
    ).toBeInTheDocument();

    expect(await screen.findByTestId("ErrorView")).toBeInTheDocument();

    expect(
      await screen.findByRole("region", {
        name: "ComposerCreatorProvider-NoServiceModel_failed",
      })
    ).toBeInTheDocument();

    expect(
      await screen.findByText("There is no service model available for child-service")
    ).toBeInTheDocument();
  });

  it("navigating out of the View works correctly", async () => {
    render(setup());

    const composer = await screen.findByTestId("Composer-Container");

    expect(composer).toBeInTheDocument();

    await userEvent.click(await screen.findByRole("button", { name: "Cancel" }));

    expect(await screen.findByTestId("inventory-page")).toBeInTheDocument();
  });
});
