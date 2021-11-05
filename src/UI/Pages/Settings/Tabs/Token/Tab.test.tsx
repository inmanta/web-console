import React from "react";
import { act, render, screen, within } from "@testing-library/react";
import { DependencyProvider } from "@/UI";
import {
  DeferredApiHelper,
  dependencies,
  DynamicCommandManagerResolver,
} from "@/Test";
import { CommandResolverImpl, GenerateTokenCommandManager } from "@/Data";
import { Tab } from "./Tab";
import userEvent from "@testing-library/user-event";
import { Either } from "@/Core";

function setup() {
  const apiHelper = new DeferredApiHelper();
  const commandManager = new GenerateTokenCommandManager(apiHelper, "env");
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
  const generateButton = screen.getByRole("button", { name: "Generate" });
  expect(generateButton).toBeVisible();
  expect(generateButton).toBeEnabled();

  expect(apiHelper.pendingRequests).toHaveLength(0);
  userEvent.click(generateButton);
  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "POST",
    body: { client_types: [], idempotent: false },
    url: `/api/v2/environment_auth`,
    environment: "env",
  });
});

test("GIVEN TokenTab WHEN api clientType is selected and generate button is clicked THEN generate call is executed with clientType set", async () => {
  const { component, apiHelper } = setup();
  render(component);
  userEvent.click(screen.getByRole("button", { name: "AgentOption" }));
  userEvent.click(screen.getByRole("button", { name: "Generate" }));
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "POST",
    body: { client_types: ["agent"], idempotent: false },
    url: `/api/v2/environment_auth`,
    environment: "env",
  });
});

test("GIVEN TokenTab WHEN generate fails THEN the error is shown", async () => {
  const { component, apiHelper } = setup();
  render(component);
  userEvent.click(screen.getByRole("button", { name: "Generate" }));

  await act(async () => {
    await apiHelper.resolve(Either.left("error message"));
  });

  const errorContainer = screen.getByRole("generic", {
    name: "GenerateTokenError",
  });
  expect(errorContainer).toBeVisible();
  const errorMessage = within(errorContainer).getByText("error message");
  expect(errorMessage).toBeVisible();
  expect(errorMessage).toHaveTextContent("error message");
});

test("GIVEN TokenTab WHEN generate succeeds THEN the token is shown", async () => {
  const { component, apiHelper } = setup();
  render(component);
  const copyButton = screen.getByRole("button", { name: "Copy to clipboard" });
  const tokenOutput = screen.getByRole("textbox", { name: "TokenOutput" });
  expect(copyButton).toBeDisabled();
  expect(tokenOutput).toHaveValue("");
  userEvent.click(screen.getByRole("button", { name: "Generate" }));
  await act(async () => {
    await apiHelper.resolve(Either.right({ data: "tokenstring123" }));
  });
  expect(copyButton).toBeEnabled();
  expect(tokenOutput).toHaveValue("tokenstring123");
});
