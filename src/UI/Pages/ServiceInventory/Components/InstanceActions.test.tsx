import {
  BaseApiHelper,
  CommandResolverImpl,
  DeleteInstanceCommandManager,
  KeycloakAuthHelper,
  TriggerSetStateCommandManager,
} from "@/Data";
import {
  DeferredApiHelper,
  DynamicCommandManagerResolver,
  MockEnvironmentModifier,
  ServiceInstance,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { render, screen } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router";
import { InstanceActions } from "./InstanceActions";

test("Given InstanceActions component When the instance is terminated Then the actions are still shown", async () => {
  const apiHelper = new DeferredApiHelper();
  const deleteCommandManager = new DeleteInstanceCommandManager(
    apiHelper,
    "env1"
  );

  const setStateCommandManager = new TriggerSetStateCommandManager(
    new KeycloakAuthHelper(),
    new BaseApiHelper(),
    "env1"
  );

  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      deleteCommandManager,
      setStateCommandManager,
    ])
  );
  const component = (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{
          commandResolver,
          environmentModifier: new MockEnvironmentModifier(),
        }}
      >
        <InstanceActions
          instance={ServiceInstance.deleted}
          editDisabled={true}
          deleteDisabled={true}
          diagnoseDisabled={true}
        />
      </DependencyProvider>
    </MemoryRouter>
  );
  render(component);
  expect(await screen.findByRole("button", { name: "History" })).toBeVisible();
});
