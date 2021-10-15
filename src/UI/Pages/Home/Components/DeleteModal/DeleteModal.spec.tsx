import React from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DependencyProvider } from "@/UI";
import {
  CommandResolverImpl,
  DeleteEnvironmentCommandManager,
  EnvironmentDeleter,
  FetcherImpl,
  getStoreInstance,
  ProjectsQueryManager,
  ProjectsStateHelper,
  ProjectsUpdater,
  QueryResolverImpl,
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
  const projectsFetcher = new FetcherImpl<"Projects">(apiHelper);
  const projectsStateHelper = new ProjectsStateHelper(store);
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new ProjectsQueryManager(projectsFetcher, projectsStateHelper),
    ])
  );

  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      new DeleteEnvironmentCommandManager(
        new EnvironmentDeleter(apiHelper),
        new ProjectsUpdater(projectsStateHelper, projectsFetcher)
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
  expect(request.request).toEqual({
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
    await apiHelper.resolve(Either.right(Project.list));
  });
  expect(apiHelper.resolvedRequests).toHaveLength(2);
  expect(apiHelper.pendingRequests).toHaveLength(0);
});

// test.only("GIVEN DeleteModal WHEN delete executed and error THEN error is shown", async () => {
//   const { component, apiHelper } = setup();
//   render(component);
//   const input = screen.getByRole<HTMLInputElement>("textbox", {
//     name: "Delete Environment Check",
//   });
//   const deleteButton = screen.getByRole("button", { name: "Delete" });
//   userEvent.type(input, "connect");
//   userEvent.click(deleteButton);
//   await act(async () => {
//     await apiHelper.resolve(Maybe.some("error message"));
//   });
// });
