import React from "react";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DependencyProvider } from "@/UI";
import {
  CommandResolverImpl,
  DeleteEnvironmentCommandManager,
  getStoreInstance,
  GetProjectsQueryManager,
  GetProjectsStateHelper,
  QueryResolverImpl,
  EnvironmentsUpdater,
  GetEnvironmentsStateHelper,
} from "@/Data";
import {
  DeferredApiHelper,
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
  Project,
} from "@/Test";
import { DeleteModal } from "./DeleteModal";
import { Either, Maybe } from "@/Core";

function setup() {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const projectsStateHelper = new GetProjectsStateHelper(store);
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new GetProjectsQueryManager(apiHelper, projectsStateHelper),
    ])
  );

  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      new DeleteEnvironmentCommandManager(
        apiHelper,
        new EnvironmentsUpdater(
          new GetEnvironmentsStateHelper(store),
          apiHelper
        )
      ),
    ])
  );

  const component = (
    <DependencyProvider dependencies={{ queryResolver, commandResolver }}>
      <DeleteModal
        isOpen
        onClose={jest.fn}
        environment={{ id: "abcd", name: "connect" }}
      />
    </DependencyProvider>
  );

  return { component, apiHelper };
}

test("GIVEN DeleteModal WHEN empty or wrong env THEN delete disabled", async () => {
  const { component } = setup();
  render(component);
  const input = screen.getByRole<HTMLInputElement>("textbox", {
    name: "Delete Environment Check",
  });
  const deleteButton = screen.getByRole("button", { name: "Delete" });
  expect(input.value).toHaveLength(0);
  expect(deleteButton).toBeDisabled();

  userEvent.type(input, "wrong");
  expect(input.value).toMatch("wrong");
  expect(deleteButton).toBeDisabled();
});

test("GIVEN DeleteModal WHEN correct env THEN delete enabled", async () => {
  const { component } = setup();
  render(component);
  const input = screen.getByRole<HTMLInputElement>("textbox", {
    name: "Delete Environment Check",
  });
  const deleteButton = screen.getByRole("button", { name: "Delete" });
  expect(input.value).toHaveLength(0);
  expect(deleteButton).toBeDisabled();

  userEvent.type(input, "connect");
  expect(input.value).toMatch("connect");
  expect(deleteButton).toBeEnabled();
});

test("GIVEN DeleteModal WHEN correct env & delete button pressed THEN delete executed", async () => {
  const { component, apiHelper } = setup();
  render(component);
  const input = screen.getByRole<HTMLInputElement>("textbox", {
    name: "Delete Environment Check",
  });
  const deleteButton = screen.getByRole("button", { name: "Delete" });
  userEvent.type(input, "connect");
  userEvent.click(deleteButton);
  expect(apiHelper.pendingRequests).toHaveLength(1);
  const request = apiHelper.pendingRequests[0];
  expect(request).toEqual({
    method: "DELETE",
    environment: "abcd",
    url: "/api/v2/environment/abcd",
  });

  await act(async () => {
    await apiHelper.resolve(Maybe.none());
  });
  expect(apiHelper.resolvedRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests).toHaveLength(1);
  await act(async () => {
    await apiHelper.resolve(Either.right({ data: Project.list }));
  });
  expect(apiHelper.resolvedRequests).toHaveLength(2);
  expect(apiHelper.pendingRequests).toHaveLength(0);
});

test("GIVEN DeleteModal WHEN delete executed and error THEN error is shown", async () => {
  const { component, apiHelper } = setup();
  render(component);
  const input = screen.getByRole<HTMLInputElement>("textbox", {
    name: "Delete Environment Check",
  });
  userEvent.type(input, "connect");
  userEvent.click(screen.getByRole("button", { name: "Delete" }));
  await act(async () => {
    await apiHelper.resolve(Maybe.some("error message"));
  });
  const errorAlert = screen.getByRole("generic", {
    name: "Environment Error Alert",
  });
  expect(within(errorAlert).getByText("error message")).toBeVisible();
});
