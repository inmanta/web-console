import { dia } from "@inmanta/rappid";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { CanvasContext, defaultCanvasContext } from "../Context";
import { parentModel } from "../Mocks";
import { createComposerEntity } from "../actions";
import { getCellsCoordinates } from "../helpers";
import { ComposerPaper } from "../paper";
import { ServiceEntityBlock } from "../shapes";
import { defineObjectsForJointJS } from "../testSetup";
import { EntityForm } from "./EntityForm";

describe("EntityForm.", () => {
  const setup = (
    showButtons: boolean,
    isRemovable: boolean,
    isDisabled: boolean,
    isInEditMode: boolean = false
  ) => {
    const graph = new dia.Graph();
    const paper = new ComposerPaper({}, graph, true).paper;

    const cell = createComposerEntity({
      serviceModel: parentModel,
      isCore: true,
      isInEditMode,
      attributes: { name: "", service_id: "", should_deploy_fail: false },
    });

    graph.addCell(cell);
    const cellView = paper.findViewByModel(cell);

    const onRemove = vi.fn();
    const editEntity = vi.fn().mockReturnValue(cellView.model);

    const component = (
      <QueryClientProvider client={testClient}>
        <TestMemoryRouter initialEntries={["/?env=aaa"]}>
          <MockedDependencyProvider>
            <CanvasContext.Provider
              value={{
                ...defaultCanvasContext,
                diagramHandlers: {
                  saveAndClearCanvas: () => {},
                  loadState: () => {},
                  addInstance: (_services, _instance) => [new ServiceEntityBlock()],
                  getCoordinates: () => getCellsCoordinates(graph),
                  editEntity: (_cell, serviceModel, attributeValues) =>
                    editEntity(cellView, serviceModel, attributeValues),
                },
              }}
            >
              <EntityForm
                cellToEdit={cellView}
                isDisabled={isDisabled}
                isRemovable={isRemovable}
                onRemove={onRemove}
                showButtons={showButtons}
              />
            </CanvasContext.Provider>
          </MockedDependencyProvider>
        </TestMemoryRouter>
      </QueryClientProvider>
    );

    return {
      component,
      editEntity,
      onRemove,
    };
  };

  beforeAll(() => {
    defineObjectsForJointJS();
  });

  it("when isRemovable is set to false then Remove button is disabled", () => {
    const showButtons = true;
    const isRemovable = false;
    const isDisabled = false;

    const { component } = setup(showButtons, isRemovable, isDisabled);

    render(component);

    expect(screen.getByRole("button", { name: "Remove" })).toBeDisabled();
  });

  it("when Remove is clicked then onRemove is being called", async () => {
    const showButtons = true;
    const isRemovable = true;
    const isDisabled = false;

    const { component, onRemove } = setup(showButtons, isRemovable, isDisabled);

    render(component);

    expect(screen.getByRole("button", { name: "Remove" })).toBeEnabled();

    await userEvent.click(screen.getByRole("button", { name: "Remove" }));

    expect(onRemove).toHaveBeenCalled();
  });

  it("when isDisabled is set to false, then all inputs are disabled", () => {
    const showButtons = true;
    const isRemovable = false;
    const isDisabled = true;

    const { component } = setup(showButtons, isRemovable, isDisabled);

    render(component);

    expect(screen.getByLabelText("TextInput-service_id")).toBeDisabled();
    expect(screen.getByLabelText("TextInput-name")).toBeDisabled();
    expect(screen.getByLabelText("Toggle-should_deploy_fail")).toBeDisabled();
  });

  it("when showButtons is set to false, then all buttons are hidden", () => {
    const showButtons = false;
    const isRemovable = false;
    const isDisabled = true;

    const { component } = setup(showButtons, isRemovable, isDisabled);

    render(component);

    expect(screen.queryByText("Remove")).toBeNull();
    expect(screen.queryByText("Cancel")).toBeNull();
  });

  it("when form state will get updated cancel button will change state form disabled to enabled and when clicked then form is being cleared to initial state and cancel button will be back disabled", async () => {
    const showButtons = true;
    const isRemovable = false;
    const isDisabled = false;

    const { component, editEntity } = setup(showButtons, isRemovable, isDisabled);

    render(component);

    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByLabelText("TextInput-service_id")).toHaveValue("");
    expect(screen.getByLabelText("TextInput-name")).toHaveValue("");

    await userEvent.type(screen.getByLabelText("TextInput-service_id"), "t");

    expect(editEntity).toHaveBeenCalledWith(expect.any(Object), parentModel, {
      name: "",
      service_id: "t",
      should_deploy_fail: false,
    });

    await userEvent.type(screen.getByLabelText("TextInput-service_id"), "est_id");

    await userEvent.type(screen.getByLabelText("TextInput-name"), "test_name");

    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
    expect(screen.getByLabelText("TextInput-service_id")).toHaveValue("test_id");
    expect(screen.getByLabelText("TextInput-name")).toHaveValue("test_name");

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(editEntity).toHaveBeenCalledWith(expect.any(Object), parentModel, {
      name: "",
      service_id: "",
      should_deploy_fail: false,
    });

    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByLabelText("TextInput-service_id")).toHaveValue("");
    expect(screen.getByLabelText("TextInput-name")).toHaveValue("");
  });

  it("when isInEditMode is true, then rw inputs are disabled", () => {
    const showButtons = true;
    const isRemovable = false;
    const isDisabled = false;
    const isInEditMode = true;

    const { component } = setup(showButtons, isRemovable, isDisabled, isInEditMode);

    render(component);

    expect(screen.getByLabelText("TextInput-service_id")).toBeDisabled();
    expect(screen.getByLabelText("TextInput-name")).toBeDisabled();
    expect(screen.getByLabelText("Toggle-should_deploy_fail")).toBeEnabled();
  });
});
