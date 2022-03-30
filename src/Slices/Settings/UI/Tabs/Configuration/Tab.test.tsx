import React from "react";
import { MemoryRouter } from "react-router-dom";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either, Maybe } from "@/Core";
import {
  CommandManagerResolver,
  CommandResolverImpl,
  getStoreInstance,
  KeycloakAuthHelper,
  QueryManagerResolver,
  QueryResolverImpl,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  Environment,
  EnvironmentSettings,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI";
import { Tab } from "./Tab";

function setup() {
  const apiHelper = new DeferredApiHelper();
  const authHelper = new KeycloakAuthHelper();
  const scheduler = new StaticScheduler();
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolver(store, apiHelper, scheduler, scheduler)
  );
  const commandResolver = new CommandResolverImpl(
    new CommandManagerResolver(store, apiHelper, authHelper)
  );

  const component = (
    <MemoryRouter initialEntries={[{ search: "?env=env" }]}>
      <StoreProvider store={store}>
        <DependencyProvider
          dependencies={{ ...dependencies, queryResolver, commandResolver }}
        >
          <Tab environmentId="env" />
        </DependencyProvider>
      </StoreProvider>
    </MemoryRouter>
  );

  return { component, apiHelper };
}

test("GIVEN ConfigurationTab THEN shows all settings", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: "/api/v2/environment_settings",
    environment: "env",
  });

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

  expect(within(row).getByRole("button", { name: "SaveAction" })).toBeVisible();

  expect(
    within(row).getByRole("button", { name: "ResetAction" })
  ).toBeVisible();
});

test("GIVEN ConfigurationTab WHEN editing a dict field THEN shows warning icon", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: EnvironmentSettings.base }));
  });

  const row = screen.getByRole("row", {
    name: "Row-autostart_agent_map",
  });

  const newEntryRow = within(row).getByRole("row", { name: "Row-newEntry" });
  const newKeyInput = within(newEntryRow).getByRole("textbox", {
    name: "editEntryKey",
  });

  expect(
    within(row).queryByRole("generic", { name: "Warning" })
  ).not.toBeInTheDocument();
  await userEvent.type(newKeyInput, "testKey");
  expect(
    within(row).getByRole("generic", { name: "Warning" })
  ).toBeInTheDocument();
});

test("GIVEN ConfigurationTab WHEN editing an enum field THEN shows warning icon", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: EnvironmentSettings.base }));
  });

  const row = screen.getByRole("row", {
    name: "Row-agent_trigger_method_on_auto_deploy",
  });

  await userEvent.click(
    within(row).getByRole("button", {
      name: "EnumInput-agent_trigger_method_on_auto_deploy",
    })
  );
  expect(
    within(row).queryByRole("generic", { name: "Warning" })
  ).not.toBeInTheDocument();
  await userEvent.click(
    within(row).getByRole("option", { name: "push_full_deploy" })
  );
  expect(
    within(row).getByRole("generic", { name: "Warning" })
  ).toBeInTheDocument();
});

test("GIVEN ConfigurationTab WHEN editing a boolean field THEN shows warning icon", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: EnvironmentSettings.base }));
  });

  const row = screen.getByRole("row", {
    name: "Row-auto_deploy",
  });

  expect(
    within(row).queryByRole("generic", { name: "Warning" })
  ).not.toBeInTheDocument();
  await userEvent.click(
    within(row).getByRole<HTMLInputElement>("checkbox", {
      name: "Toggle-auto_deploy",
    })
  );
  expect(
    within(row).getByRole("generic", { name: "Warning" })
  ).toBeInTheDocument();
});

test("GIVEN ConfigurationTab WHEN editing a number field THEN shows warning icon", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: EnvironmentSettings.base }));
  });

  const row = screen.getByRole("row", {
    name: "Row-autostart_agent_deploy_interval",
  });

  expect(
    within(row).queryByRole("generic", { name: "Warning" })
  ).not.toBeInTheDocument();
  await userEvent.click(within(row).getByRole("button", { name: "plus" }));
  expect(
    within(row).getByRole("generic", { name: "Warning" })
  ).toBeInTheDocument();
});

test("GIVEN ConfigurationTab and boolean input WHEN changing boolean value and saving THEN update is performed", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: EnvironmentSettings.base }));
  });

  const row = screen.getByRole("row", {
    name: "Row-auto_deploy",
  });

  const toggle = within(row).getByRole<HTMLInputElement>("checkbox", {
    name: "Toggle-auto_deploy",
  });

  expect(toggle.checked).toBeFalsy();
  await userEvent.click(toggle);
  expect(toggle.checked).toBeTruthy();
  expect(apiHelper.resolvedRequests).toHaveLength(1);

  await userEvent.click(
    within(row).getByRole("button", { name: "SaveAction" }),
    {
      skipHover: true,
    }
  );

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "POST",
    url: "/api/v2/environment_settings/auto_deploy",
    environment: "env",
    body: { value: true },
  });

  await act(async () => {
    await apiHelper.resolve(Maybe.none());
  });

  expect(apiHelper.resolvedRequests).toHaveLength(2);

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: "/api/v2/environment_settings/auto_deploy",
    environment: "env",
  });

  await act(async () => {
    await apiHelper.resolve(
      Either.right({ data: EnvironmentSettings.auto_deploy })
    );
  });

  expect(apiHelper.resolvedRequests).toHaveLength(3);
  expect(toggle.checked).toBeTruthy();
});

test("GIVEN ConfigurationTab and boolean input WHEN clicking reset THEN delete is performed", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: EnvironmentSettings.base }));
  });

  const row = screen.getByRole("row", {
    name: "Row-auto_deploy",
  });

  const toggle = within(row).getByRole<HTMLInputElement>("checkbox", {
    name: "Toggle-auto_deploy",
  });

  expect(toggle.checked).toBeFalsy();

  await userEvent.click(
    within(row).getByRole("button", { name: "ResetAction" }),
    {
      skipHover: true,
    }
  );

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "DELETE",
    url: "/api/v2/environment_settings/auto_deploy",
    environment: "env",
  });

  await act(async () => {
    await apiHelper.resolve(Maybe.none());
  });

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: "/api/v2/environment_settings/auto_deploy",
    environment: "env",
  });

  await act(async () => {
    await apiHelper.resolve(
      Either.right({ data: EnvironmentSettings.auto_deploy })
    );
  });

  expect(toggle.checked).toBeTruthy();
});

test("GIVEN ConfigurationTab and dict input WHEN adding an entry and saving THEN entry is locked in", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: EnvironmentSettings.base }));
  });

  const row = screen.getByRole("row", {
    name: "Row-autostart_agent_map",
  });

  const newEntryRow = within(row).getByRole("row", { name: "Row-newEntry" });
  const newKeyInput = within(newEntryRow).getByRole("textbox", {
    name: "editEntryKey",
  });
  await userEvent.type(newKeyInput, "testKey");
  const newValueInput = within(newEntryRow).getByRole("textbox", {
    name: "editEntryValue",
  });
  await userEvent.type(newValueInput, "testValue");

  await userEvent.click(
    within(row).getByRole("button", { name: "SaveAction" }),
    {
      skipHover: true,
    }
  );

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "POST",
    url: "/api/v2/environment_settings/autostart_agent_map",
    environment: "env",
    body: {
      value: { internal: "local:", testKey: "testValue" },
    },
  });

  await act(async () => {
    await apiHelper.resolve(Maybe.none());
  });

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: "/api/v2/environment_settings/autostart_agent_map",
    environment: "env",
  });

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        data: EnvironmentSettings.autostart_agent_map({ testKey: "testValue" }),
      })
    );
  });

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        data: Environment.a,
      })
    );
  });

  expect(
    within(row).getByRole("row", { name: "Row-testKey" })
  ).toBeInTheDocument();
  expect(newKeyInput).toHaveValue("");
  expect(newValueInput).toHaveValue("");
});
