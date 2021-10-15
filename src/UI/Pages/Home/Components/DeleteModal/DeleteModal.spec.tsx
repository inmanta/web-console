import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DependencyProvider } from "@/UI";
import {
  BaseApiHelper,
  CommandResolverImpl,
  DeleteEnvironmentCommandManager,
  EnvironmentDeleter,
  getStoreInstance,
  ProjectsQueryManager,
  ProjectsStateHelper,
  ProjectsUpdater,
  QueryResolverImpl,
} from "@/Data";
import {
  DeferredFetcher,
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
} from "@/Test";
import { DeleteModal } from "./DeleteModal";

function setup() {
  const store = getStoreInstance();
  const apiHelper = new BaseApiHelper();
  const projectsFetcher = new DeferredFetcher<"Projects">();
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

  return { component };
}

test("GIVEN DeleteModal WHEN empty or wrong env THEN delete disabled", async () => {
  const { component } = setup();
  render(component);
  const input = screen.getByRole<HTMLInputElement>("textbox", {
    name: "Delete Environment Check",
  });
  const deleteButton = screen.getByRole("button", { name: "Delete" });
  expect(input.value).toMatch("");
  expect(deleteButton).toBeDisabled();

  userEvent.type(input, "wrong");
  expect(input.value).toMatch("wrong");
  expect(deleteButton).toBeDisabled();

  userEvent.clear(input);
  userEvent.type(input, "connect");
  expect(input.value).toMatch("connect");
  expect(deleteButton).toBeEnabled();
});
