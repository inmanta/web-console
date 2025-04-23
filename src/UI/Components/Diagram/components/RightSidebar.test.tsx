import React from "react";
import { useLocation } from "react-router-dom";
import { dia } from "@inmanta/rappid";
import { QueryClientProvider, UseQueryResult } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { RemoteData } from "@/Core";
import { getStoreInstance } from "@/Data";
import { Inventories } from "@/Data/Managers/V2/ServiceInstance";
import { dependencies } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { DependencyProvider, EnvironmentHandlerImpl } from "@/UI/Dependency";
import { PrimaryRouteManager } from "@/UI/Routing";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { CanvasContext, InstanceComposerContext, defaultCanvasContext } from "../Context";
import { containerModel } from "../Mocks";
import { addDefaultEntities } from "../actions/createMode";
import { StencilState } from "../interfaces";
import { ComposerPaper } from "../paper";
import { defineObjectsForJointJS } from "../testSetup";
import { RightSidebar } from "./RightSidebar";

describe("RightSidebar.", () => {
  const setup = (cellToEdit: dia.CellView | null, stencilState: StencilState) => {
    const environmentHandler = EnvironmentHandlerImpl(useLocation, PrimaryRouteManager(""));
    const store = getStoreInstance();

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
        {
          id: "bbb",
          name: "env-b",
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

    const component = (
      <QueryClientProvider client={testClient}>
        <TestMemoryRouter initialEntries={["/?env=aaa"]}>
          <StoreProvider store={store}>
            <DependencyProvider dependencies={{ ...dependencies, environmentHandler }}>
              <InstanceComposerContext.Provider
                value={{
                  mainService: containerModel, //Sidebar use only mainService, rest can be mocked
                  instance: null,
                  serviceModels: [],
                  relatedInventoriesQuery: {} as UseQueryResult<Inventories, Error>,
                }}
              >
                <CanvasContext.Provider
                  value={{
                    ...defaultCanvasContext,
                    cellToEdit,
                    stencilState,
                  }}
                >
                  <RightSidebar editable={true} />
                </CanvasContext.Provider>
              </InstanceComposerContext.Provider>
            </DependencyProvider>
          </StoreProvider>
        </TestMemoryRouter>
      </QueryClientProvider>
    );

    return { component };
  };

  beforeAll(() => {
    defineObjectsForJointJS();
  });

  it("it should not render Form without cell or", () => {
    const cellToEdit = null;
    const { component } = setup(cellToEdit, {});

    render(component);
    expect(screen.queryByTestId("entity-form")).toBeNull();

    expect(screen.getByText("No details available")).toBeVisible();
    expect(screen.getByText("Select an element to display the form.")).toBeVisible();
  });

  it("it should not render Form with cell that doesn't have service model", () => {
    const graph = new dia.Graph();
    const paper = new ComposerPaper({}, graph, true).paper;

    addDefaultEntities(graph, containerModel);
    const cellToEdit = paper.findViewByModel(graph.getElements()[0]) as dia.CellView;

    cellToEdit.model.set("serviceModel", null);

    const { component } = setup(cellToEdit, {});

    render(component);

    expect(screen.queryByTestId("entity-form")).toBeNull();

    expect(screen.getByText("No details available")).toBeVisible();
    expect(screen.getByText("Select an element to display the form.")).toBeVisible();
  });

  it("it should render Form when cell with service model exist", () => {
    const graph = new dia.Graph();
    const paper = new ComposerPaper({}, graph, true).paper;

    addDefaultEntities(graph, containerModel);
    const cellToEdit = paper.findViewByModel(graph.getElements()[0]) as dia.CellView;

    const { component } = setup(cellToEdit, {});

    render(component);

    expect(screen.queryByTestId("entity-form")).toBeVisible();

    expect(screen.queryByText("No details available")).toBeNull();
    expect(screen.queryByText("Select an element to display the form.")).toBeNull();
  });
});
