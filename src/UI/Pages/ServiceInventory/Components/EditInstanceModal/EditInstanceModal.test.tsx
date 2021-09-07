import { render, screen } from "@testing-library/react";
import React from "react";
import userEvent from "@testing-library/user-event";
import { EditInstanceModal } from "./EditInstanceModal";
import {
  CommandResolverImpl,
  AttributeResultConverterImpl,
  TriggerInstanceUpdateCommandManager,
  BaseApiHelper,
  TriggerInstanceUpdatePatcher,
} from "@/Data";
import { DynamicCommandManagerResolver, Service } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";

function setup() {
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
  const commandManager = new TriggerInstanceUpdateCommandManager(
    new TriggerInstanceUpdatePatcher(new BaseApiHelper(), "env1"),
    new AttributeResultConverterImpl()
  );
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([commandManager])
  );
  return {
    component: (
      <DependencyProvider dependencies={{ commandResolver }}>
        <EditInstanceModal
          instance={instance}
          serviceEntity={Service.nestedEditable}
        />
      </DependencyProvider>
    ),
  };
}

it("EditInstanceModal shows form when clicking on modal button", async () => {
  const { component } = setup();
  render(component);
  const modalButton = await screen.findByText("Edit");
  userEvent.click(modalButton);
  expect(await screen.findByText("Confirm")).toBeVisible();
  expect(await screen.findByText("Cancel")).toBeVisible();
});
it("EditInstanceModal closes when cancelled", async () => {
  const { component } = setup();
  render(component);
  const modalButton = await screen.findByText("Edit");
  userEvent.click(modalButton);
  const noButton = await screen.findByText("Cancel");
  userEvent.click(noButton);
  expect(screen.queryByText("Confirm")).not.toBeInTheDocument();
});
