import React from "react";
import { render, screen, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
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
  MockEnvironmentModifier,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { Provider } from "./Provider";

function setup(
  details = {
    halted: false,
    server_compile: true,
    protected_environment: false,
    enable_lsm_expert_mode: false,
  }
) {
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

  const environmentModifier = new MockEnvironmentModifier(details);

  const component = (
    <StoreProvider store={store}>
      <DependencyProvider
        dependencies={{
          ...dependencies,
          environmentModifier,
          commandResolver,
          queryResolver,
        }}
      >
        <Provider />
      </DependencyProvider>
    </StoreProvider>
  );
  return { component, apiHelper, scheduler };
}

test("GIVEN CompileButton THEN is live updated", async () => {
  const { component, apiHelper, scheduler } = setup();
  render(component);

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "HEAD",
    url: "/api/v1/notify/env",
  });

  await act(async () => {
    await apiHelper.resolve(204);
  });

  const widget = screen.getByRole("generic", { name: "CompileWidget" });
  expect(widget).toBeVisible();

  const button = within(widget).getByRole("button", {
    name: "RecompileButton",
  });

  expect(button).toBeEnabled();

  scheduler.executeAll();

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "HEAD",
    url: "/api/v1/notify/env",
  });

  await act(async () => {
    await apiHelper.resolve(200);
  });

  expect(button).toBeDisabled();
});

test("GIVEN CompileButton WHEN clicked THEN triggers recompile", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(204);
  });

  const widget = screen.getByRole("generic", { name: "CompileWidget" });
  const button = within(widget).getByRole("button", {
    name: "RecompileButton",
  });

  await userEvent.click(button);

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "POST",
    url: "/api/v1/notify/env",
    body: {
      update: false,
      metadata: {
        type: "console",
        message: "Compile triggered from the console",
      },
    },
  });
  await act(async () => {
    await apiHelper.resolve({});
  });
  // Check if update to the compiler status is triggered
  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "HEAD",
    url: "/api/v1/notify/env",
  });
  expect(button).toBeDisabled();
  await act(async () => {
    await apiHelper.resolve(204);
  });
  expect(button).toBeEnabled();
});

test("GIVEN CompileButton WHEN clicked on toggle and clicked on Update & Recompile option THEN triggers recompile with update", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(204);
  });

  const widget = screen.getByRole("generic", { name: "CompileWidget" });
  expect(widget).toBeVisible();

  const toggle = within(widget).getByRole("button", {
    name: "Toggle",
  });

  expect(toggle).toBeEnabled();

  await act(async () => {
    await userEvent.click(toggle);
  });

  const button = within(widget).getByRole("menuitem", {
    name: "UpdateAndRecompileButton",
  });

  await userEvent.click(button);

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "POST",
    url: "/api/v1/notify/env",
    body: {
      update: true,
      metadata: {
        type: "console",
        message: "Compile triggered from the console",
      },
    },
  });
});

test("GIVEN CompileButton WHEN environmentSetting server_compile is disabled THEN button is disabled", async () => {
  const { component, apiHelper } = setup({
    halted: false,
    server_compile: false,
    protected_environment: false,
    enable_lsm_expert_mode: false,
  });
  render(component);

  await act(async () => {
    await apiHelper.resolve(204);
  });

  const widget = screen.getByRole("generic", { name: "CompileWidget" });
  const button = within(widget).getByRole("button", {
    name: "RecompileButton",
  });

  expect(button).toBeDisabled();
});
