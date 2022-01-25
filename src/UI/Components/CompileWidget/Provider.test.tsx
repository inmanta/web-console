import React from "react";
import { render, screen, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  CommandResolverImpl,
  QueryResolverImpl,
  TriggerCompileCommandManager,
} from "@/Data";
import { GetCompilerStatusQueryManager } from "@/Data/Managers/GetCompilerStatus";
import {
  DeferredApiHelper,
  dependencies,
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { Provider } from "./Provider";

function setup() {
  const apiHelper = new DeferredApiHelper();
  const scheduler = new StaticScheduler();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new GetCompilerStatusQueryManager(apiHelper, scheduler),
    ])
  );
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      new TriggerCompileCommandManager(apiHelper),
    ])
  );

  const component = (
    <DependencyProvider
      dependencies={{ ...dependencies, commandResolver, queryResolver }}
    >
      <Provider />
    </DependencyProvider>
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

  userEvent.click(button);

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

  userEvent.click(toggle);

  const button = within(widget).getByRole("button", {
    name: "UpdateAndRecompileButton",
  });

  userEvent.click(button);

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
