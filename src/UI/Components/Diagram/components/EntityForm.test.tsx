import React from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { InstanceAttributeModel, RemoteData } from "@/Core";
import { getStoreInstance } from "@/Data";
import { dependencies } from "@/Test";
import { DependencyProvider, EnvironmentHandlerImpl } from "@/UI/Dependency";
import { PrimaryRouteManager } from "@/UI/Routing";
import { parentModel } from "../Mocks";
import { EntityForm } from "./EntityForm";

describe("EntityForm.", () => {
  const setup = (
    showButtons: boolean,
    isRemovable: boolean,
    isEdited: boolean,
    isDisabled,
    attributes: InstanceAttributeModel,
  ) => {
    const client = new QueryClient();
    const environmentHandler = EnvironmentHandlerImpl(
      useLocation,
      PrimaryRouteManager(""),
    );
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
        },
        {
          id: "bbb",
          name: "env-b",
          project_id: "ppp",
          repo_branch: "branch",
          repo_url: "repo",
          projectName: "project",
        },
      ]),
    );
    const onSave = jest.fn();
    const onRemove = jest.fn();

    const component = (
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[{ search: "?env=aaa" }]}>
          <StoreProvider store={store}>
            <DependencyProvider
              dependencies={{ ...dependencies, environmentHandler }}
            >
              <EntityForm
                serviceModel={parentModel}
                isEdited={isEdited}
                initialState={attributes}
                onSave={onSave}
                isDisabled={isDisabled}
                isRemovable={isRemovable}
                onRemove={onRemove}
                showButtons={showButtons}
              />
            </DependencyProvider>
          </StoreProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    return {
      component,
      onSave,
      onRemove,
    };
  };

  it("when isRemovable is set to false then Remove button is disabled", () => {
    const showButtons = true;
    const isRemovable = false;
    const isEdited = false;
    const isDisabled = false;
    const attributes = {};

    const { component } = setup(
      showButtons,
      isRemovable,
      isEdited,
      isDisabled,
      attributes,
    );

    render(component);

    expect(screen.getByRole("button", { name: "Remove" })).toBeDisabled();
  });

  it("when Remove is clicked then onRemove is being called", async () => {
    const showButtons = true;
    const isRemovable = true;
    const isEdited = false;
    const isDisabled = false;
    const attributes = {};

    const { component, onRemove } = setup(
      showButtons,
      isRemovable,
      isEdited,
      isDisabled,
      attributes,
    );

    render(component);

    expect(screen.getByRole("button", { name: "Remove" })).toBeEnabled();

    await userEvent.click(screen.getByRole("button", { name: "Remove" }));

    expect(onRemove).toHaveBeenCalled();
  });

  it("when isDisabled is set to false, then all inputs are disabled", () => {
    const showButtons = true;
    const isRemovable = false;
    const isEdited = false;
    const isDisabled = true;
    const attributes = {
      name: "",
      should_deploy_fail: false,
      service_id: "",
    };

    const { component } = setup(
      showButtons,
      isRemovable,
      isEdited,
      isDisabled,
      attributes,
    );

    render(component);

    expect(screen.getByLabelText("TextInput-service_id")).toBeDisabled();
    expect(screen.getByLabelText("TextInput-name")).toBeDisabled();
    expect(screen.getByLabelText("Toggle-should_deploy_fail")).toBeDisabled();
  });

  it("when showButtons is set to false, then all buttons are hidden", () => {
    const showButtons = false;
    const isRemovable = false;
    const isEdited = false;
    const isDisabled = true;
    const attributes = {
      name: "",
      should_deploy_fail: false,
      service_id: "",
    };

    const { component } = setup(
      showButtons,
      isRemovable,
      isEdited,
      isDisabled,
      attributes,
    );

    render(component);

    expect(screen.queryByText("Remove")).toBeNull();
    expect(screen.queryByText("Cancel")).toBeNull();
  });

  it("when form state will get updated cancel button will change state form disabled to enabled and when clicked then form is being cleared to initial state and cancel button will be back disabled", async () => {
    const showButtons = true;
    const isRemovable = false;
    const isEdited = false;
    const isDisabled = false;
    const attributes = {
      name: "",
      should_deploy_fail: false,
      service_id: "",
    };

    const { component, onSave } = setup(
      showButtons,
      isRemovable,
      isEdited,
      isDisabled,
      attributes,
    );

    render(component);

    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByLabelText("TextInput-service_id")).toHaveValue("");
    expect(screen.getByLabelText("TextInput-name")).toHaveValue("");

    await userEvent.type(screen.getByLabelText("TextInput-service_id"), "t");

    expect(onSave).toHaveBeenCalledWith(expect.any(Array), {
      name: "",
      service_id: "t",
      should_deploy_fail: false,
    });

    await userEvent.type(
      screen.getByLabelText("TextInput-service_id"),
      "est_id",
    );

    await userEvent.type(screen.getByLabelText("TextInput-name"), "test_name");

    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
    expect(screen.getByLabelText("TextInput-service_id")).toHaveValue(
      "test_id",
    );
    expect(screen.getByLabelText("TextInput-name")).toHaveValue("test_name");

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onSave).toHaveBeenCalledWith(expect.any(Array), {
      name: "",
      service_id: "",
      should_deploy_fail: false,
    });

    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByLabelText("TextInput-service_id")).toHaveValue("");
    expect(screen.getByLabelText("TextInput-name")).toHaveValue("");
  });
});
