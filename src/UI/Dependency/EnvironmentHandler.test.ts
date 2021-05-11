import { getStoreInstance } from "../Store";
import { createMemoryHistory } from "history";
import { EnvironmentHandlerImpl } from ".";
import { RemoteData } from "@/Core";
import { testProjects } from "@/Test";

test("EnvironmentHandler sets default environment correctly", () => {
  const history = createMemoryHistory();
  const store = getStoreInstance();

  const environmentHandler = new EnvironmentHandlerImpl(history, store);
  environmentHandler.setDefault(RemoteData.success(testProjects), () => {
    return;
  });
  expect(store.getState().projects.selectedEnvironmentId).toEqual("env-id");
  expect(store.getState().projects.selectedProjectId).toEqual("project-id");
  expect(history.location.search).toEqual("?env=env-id");
});

test("EnvironmentHandler updates environment correctly", () => {
  const history = createMemoryHistory();
  const store = getStoreInstance();

  const environmentHandler = new EnvironmentHandlerImpl(history, store);
  environmentHandler.setDefault(RemoteData.success(testProjects), () => {
    return;
  });
  environmentHandler.set("project-id2", "env-id2");
  expect(store.getState().projects.selectedEnvironmentId).toEqual("env-id2");
  expect(store.getState().projects.selectedProjectId).toEqual("project-id2");
  expect(history.location.search).toEqual("?env=env-id2");
});

test("EnvironmentHandler determines selected environment correctly", () => {
  const history = createMemoryHistory();
  const store = getStoreInstance();

  const environmentHandler = new EnvironmentHandlerImpl(history, store);
  // Default is loading
  expect(
    RemoteData.isLoading(environmentHandler.determineSelected())
  ).toBeTruthy();

  // If the fetching fails, the selectedEnvironment should be failed as well
  store
    .getActions()
    .projects.setAllProjects(RemoteData.failed("Failure message"));
  expect(
    RemoteData.isFailed(environmentHandler.determineSelected())
  ).toBeTruthy();

  // Fetching is successful, but the selection logic has not finished yet
  store.getActions().projects.setAllProjects(RemoteData.success(testProjects));
  expect(
    RemoteData.isLoading(environmentHandler.determineSelected())
  ).toBeTruthy();

  // Only the project is selected
  expect(
    RemoteData.isLoading(environmentHandler.determineSelected(testProjects[0]))
  ).toBeTruthy();

  // Both are selected
  expect(
    RemoteData.isSuccess(
      environmentHandler.determineSelected(
        testProjects[0],
        testProjects[0].environments[0]
      )
    )
  ).toBeTruthy();

  // Fetching is successful, but the list is empty
  store.getActions().projects.setAllProjects(RemoteData.success([]));
  expect(
    RemoteData.isFailed(environmentHandler.determineSelected())
  ).toBeTruthy();

  // TODO: add test for other new classes (data fetching?)
});
