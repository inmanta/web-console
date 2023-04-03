import React from "react";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Either } from "@/Core";
import { CommandResolverImpl, GenerateTokenCommandManager } from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  DynamicCommandManagerResolver,
} from "@/Test";
import { DependencyProvider, words } from "@/UI";
import { Tab } from "./Tab";

function setup() {
  const apiHelper = new DeferredApiHelper();
  const commandManager = GenerateTokenCommandManager(apiHelper);
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([commandManager])
  );

  const component = (
    <DependencyProvider dependencies={{ ...dependencies, commandResolver }}>
      <Tab />
    </DependencyProvider>
  );

  return { component, apiHelper };
}

test("GIVEN TokenTab WHEN generate button is clicked THEN generate call is executed", async () => {
  const { component, apiHelper } = setup();
  render(component);
  const generateButton = screen.getByRole("button", {
    name: words("settings.tabs.token.generate"),
  });

  expect(generateButton).toBeVisible();
  expect(generateButton).toBeEnabled();
  expect(apiHelper.pendingRequests).toHaveLength(0);

  await act(async () => {
    await userEvent.click(generateButton);
  });

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "POST",
    body: { client_types: [] },
    url: `/api/v2/environment_auth`,
    environment: "env",
  });
});

test("GIVEN TokenTab WHEN api clientType is selected and generate button is clicked THEN generate call is executed with clientType set", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: "AgentOption" }));
  });
  await act(async () => {
    await userEvent.click(
      screen.getByRole("button", {
        name: words("settings.tabs.token.generate"),
      })
    );
  });

  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "POST",
    body: { client_types: ["agent"] },
    url: `/api/v2/environment_auth`,
    environment: "env",
  });
});

test("GIVEN TokenTab WHEN generate fails THEN the error is shown", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await userEvent.click(
      screen.getByRole("button", {
        name: words("settings.tabs.token.generate"),
      })
    );
  });

  await act(async () => {
    await apiHelper.resolve(Either.left("error message"));
  });

  const errorContainer = screen.getByRole("generic", {
    name: "GenerateTokenError",
  });

  expect(errorContainer).toBeVisible();
  expect(within(errorContainer).getByText("error message")).toBeVisible();
});

test("GIVEN TokenTab WHEN generate succeeds THEN the token is shown", async () => {
  const { component, apiHelper } = setup();
  render(component);

  const copyButton = screen.getByRole("button", { name: "Copy to clipboard" });
  const tokenOutput = screen.getByRole("textbox", { name: "TokenOutput" });

  expect(copyButton).toBeDisabled();
  expect(tokenOutput).toHaveValue("");

  await act(async () => {
    await userEvent.click(
      screen.getByRole("button", {
        name: words("settings.tabs.token.generate"),
      })
    );
  });
  await act(async () => {
    await apiHelper.resolve(Either.right({ data: "tokenstring123" }));
  });

  expect(copyButton).toBeEnabled();
  expect(tokenOutput).toHaveValue("tokenstring123");
});
