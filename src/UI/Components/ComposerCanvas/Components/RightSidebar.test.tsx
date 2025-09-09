import React from "react";
import { dia } from "@inmanta/rappid";
import { QueryClientProvider, UseQueryResult } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { Inventories } from "@/Data/Queries";
import { MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { addDefaultEntities } from "../Actions/createMode";
import { CanvasContext, InstanceComposerContext, defaultCanvasContext } from "../Context";
import { containerModel } from "../Mocks";
import { ComposerPaper } from "../Paper";
import { StencilState } from "../interfaces";
import { defineObjectsForJointJS } from "../testSetup";
import { RightSidebar } from "./RightSidebar";

describe("RightSidebar.", () => {
  const setup = (cellToEdit: dia.CellView | null, stencilState: StencilState) => {
    const component = (
      <QueryClientProvider client={testClient}>
        <TestMemoryRouter initialEntries={["/?env=aaa"]}>
          <MockedDependencyProvider>
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
          </MockedDependencyProvider>
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
