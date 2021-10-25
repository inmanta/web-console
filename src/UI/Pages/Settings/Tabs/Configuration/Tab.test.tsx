import React from "react";
import { DependencyProvider } from "@/UI";
import { Tab } from "./Tab";
import {
  DeferredApiHelper,
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
} from "@/Test";
import {
  CommandResolverImpl,
  EnvironmentSettingUpdater,
  GetEnvironmentSettingsQueryManager,
  GetEnvironmentSettingsStateHelper,
  GetEnvironmentSettingStateHelper,
  getStoreInstance,
  QueryResolverImpl,
  ResetEnvironmentSettingCommandManager,
  UpdateEnvironmentSettingCommandManager,
} from "@/Data";
import { act, render, screen, within } from "@testing-library/react";
import { Either } from "@/Core";
import { EnvironmentSettings } from "@/Test";
import { StoreProvider } from "easy-peasy";

function setup() {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new GetEnvironmentSettingsQueryManager(
        apiHelper,
        new GetEnvironmentSettingsStateHelper(store, "env"),
        "env"
      ),
    ])
  );

  const environmentSettingUpdater = new EnvironmentSettingUpdater(
    apiHelper,
    new GetEnvironmentSettingStateHelper(store, "env"),
    "env"
  );

  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      new UpdateEnvironmentSettingCommandManager(
        apiHelper,
        environmentSettingUpdater,
        "env"
      ),
      new ResetEnvironmentSettingCommandManager(
        apiHelper,
        environmentSettingUpdater,
        "env"
      ),
    ])
  );
  const component = (
    <StoreProvider store={store}>
      <DependencyProvider dependencies={{ queryResolver, commandResolver }}>
        <Tab />
      </DependencyProvider>
    </StoreProvider>
  );

  return { component, apiHelper };
}

test("GIVEN ConfigurationTab THEN shows all settings", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: EnvironmentSettings.base }));
  });

  const row = screen.getByRole("row", {
    name: "Row-agent_trigger_method_on_auto_deploy",
  });

  expect(
    within(row).getByRole("cell", {
      name: "agent_trigger_method_on_auto_deploy",
    })
  ).toBeVisible();

  expect(
    within(row).getByRole("button", {
      name: "EnumInput-agent_trigger_method_on_auto_deploy",
    })
  ).toBeVisible();

  expect(
    within(row).getByRole("generic", { name: "DefaultStatus" })
  ).toBeVisible();

  expect(within(row).getByRole("button", { name: "SaveAction" })).toBeVisible();

  expect(
    within(row).getByRole("button", { name: "ResetAction" })
  ).toBeVisible();
});
