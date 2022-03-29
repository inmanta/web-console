import React from "react";
import { MemoryRouter } from "react-router";
import { render, screen } from "@testing-library/react";
import {
  CommandResolverImpl,
  DeleteInstanceCommandManager,
  KeycloakAuthHelper,
  TriggerSetStateCommandManager,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  DynamicCommandManagerResolver,
  MockEnvironmentModifier,
  ServiceInstance,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { InstanceActions } from "./InstanceActions";

test("Given InstanceActions component When the instance is terminated Then the actions are still shown", async () => {
  const apiHelper = new DeferredApiHelper();
  const deleteCommandManager = new DeleteInstanceCommandManager(apiHelper);

  const setStateCommandManager = new TriggerSetStateCommandManager(
    new KeycloakAuthHelper(),
    apiHelper
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
          ...dependencies,
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
