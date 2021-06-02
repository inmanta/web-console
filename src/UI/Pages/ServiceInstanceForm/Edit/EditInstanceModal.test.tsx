import { render, screen } from "@testing-library/react";
import React from "react";
import userEvent from "@testing-library/user-event";
import { EditInstanceModal } from "./EditInstanceModal";
import { AttributeModel } from "@/Core";
import { BaseApiHelper } from "@/Infra";
import { UpdateInstancePatcher } from "@/Infra/Api/UpdateInstancePatcher";
import {
  AttributeResultConverterImpl,
  UpdateInstanceCommandManager,
} from "@/UI";
import { CommandResolverImpl } from "@/UI/Data";
import { DynamicCommandManagerResolver } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";

function setup() {
  const commandManager = new UpdateInstanceCommandManager(
    new UpdateInstancePatcher(new BaseApiHelper(), "env1"),
    new AttributeResultConverterImpl()
  );
  return {
    commandResolver: new CommandResolverImpl(
      new DynamicCommandManagerResolver([commandManager])
    ),
  };
}

describe("EditInstanceModal", () => {
  const instance = {
    id: "id1",
    state: "up",
    version: 10,
    service_entity: "test-service",
    environment: "env",
    candidate_attributes: null,
    active_attributes: { attr1: "some value" },
    rollback_attributes: null,
    instanceSetStateTargets: [],
    deleted: false,
  };
  const attributes: AttributeModel[] = [
    {
      name: "attr1",
      type: "string",
      description: "name",
      modifier: "rw+",
      default_value_set: false,
      default_value: null,
    },
  ];

  it("Shows edit modal", async () => {
    const { commandResolver } = setup();
    render(
      <DependencyProvider dependencies={{ commandResolver }}>
        <EditInstanceModal instance={instance} attributeModels={attributes} />
      </DependencyProvider>
    );
    expect(await screen.findByText("Edit")).toBeVisible();
  });
  it("Shows form when clicking on modal button", async () => {
    const { commandResolver } = setup();
    render(
      <DependencyProvider dependencies={{ commandResolver }}>
        <EditInstanceModal instance={instance} attributeModels={attributes} />
      </DependencyProvider>
    );
    const modalButton = await screen.findByText("Edit");
    userEvent.click(modalButton);
    expect(await screen.findByText("Confirm")).toBeVisible();
    expect(await screen.findByText("Cancel")).toBeVisible();
  });
  it("Closes modal when cancelled", async () => {
    const { commandResolver } = setup();
    render(
      <DependencyProvider dependencies={{ commandResolver }}>
        <EditInstanceModal instance={instance} attributeModels={attributes} />
      </DependencyProvider>
    );
    const modalButton = await screen.findByText("Edit");
    userEvent.click(modalButton);
    const noButton = await screen.findByText("Cancel");
    userEvent.click(noButton);
    expect(screen.queryByText("Confirm")).not.toBeInTheDocument();
  });
});
