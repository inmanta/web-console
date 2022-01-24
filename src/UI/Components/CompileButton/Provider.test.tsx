import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommandResolverImpl, TriggerCompileCommandManager } from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  DynamicCommandManagerResolver,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { Provider } from "./Provider";

function setup() {
  const apiHelper = new DeferredApiHelper();
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      new TriggerCompileCommandManager(apiHelper),
    ])
  );

  const component = (
    <DependencyProvider dependencies={{ ...dependencies, commandResolver }}>
      <Provider />
    </DependencyProvider>
  );
  return { component, apiHelper };
}

test("GIVEN CompileButton WHEN clicked THEN triggers recompile", async () => {
  const { component, apiHelper } = setup();
  render(component);

  const widget = screen.getByRole("generic", { name: "CompileButton" });
  expect(widget).toBeVisible();

  const button = within(widget).getByRole("button", {
    name: "Recompile",
  });

  userEvent.click(button);

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "POST",
    url: "/api/v1/notify/env",
    body: {
      updated: false,
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

  const widget = screen.getByRole("generic", { name: "CompileButton" });
  expect(widget).toBeVisible();

  const toggle = within(widget).getByRole("button", {
    name: "Toggle",
  });

  userEvent.click(toggle);

  const button = within(widget).getByRole("button", {
    name: "UpdateAndRecompile",
  });

  userEvent.click(button);

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "POST",
    url: "/api/v1/notify/env",
    body: {
      updated: true,
      metadata: {
        type: "console",
        message: "Compile triggered from the console",
      },
    },
  });
});
