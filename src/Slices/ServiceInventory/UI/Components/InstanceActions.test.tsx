import React from "react";
import { MemoryRouter } from "react-router";
import { act, render, screen } from "@testing-library/react";
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
import { words } from "@/UI";
import { DependencyProvider } from "@/UI/Dependency";
import { InstanceActions } from "./InstanceActions";

jest.mock("@/UI/Utils/useFeatures");

test("Given InstanceActions component When the instance is terminated Then the actions are still shown", async () => {
  const apiHelper = new DeferredApiHelper();
  const deleteCommandManager = DeleteInstanceCommandManager(apiHelper);

  const setStateCommandManager = TriggerSetStateCommandManager(
    new KeycloakAuthHelper(),
    apiHelper,
  );

  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      deleteCommandManager,
      setStateCommandManager,
    ]),
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
  act(() => {
    /* fire events that update state */
    render(component);
  });

  expect(
    await screen.findByRole("button", {
      name: words("inventory.statusTab.history"),
    }),
  ).toBeVisible();
});
