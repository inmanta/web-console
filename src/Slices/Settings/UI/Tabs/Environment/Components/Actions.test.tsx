import React, { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either, Maybe, RemoteData } from "@/Core";
import {
  CommandResolverImpl,
  getStoreInstance,
  QueryResolverImpl,
  CommandManagerResolverImpl,
  QueryManagerResolverImpl,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  EnvironmentDetails,
  EnvironmentSettings,
  Project,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI";
import { ModalProvider } from "@/UI/Root/Components/ModalProvider";
import { Actions } from "./Actions";

function setup() {
  const apiHelper = new DeferredApiHelper();

  const scheduler = new StaticScheduler();
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolverImpl(store, apiHelper, scheduler, scheduler)
  );
  const commandResolver = new CommandResolverImpl(new CommandManagerResolverImpl(store, apiHelper));

  dependencies.environmentModifier.setEnvironment("env");

  const component = (
    <StoreProvider store={store}>
      <MemoryRouter>
        <DependencyProvider dependencies={{ ...dependencies, queryResolver, commandResolver }}>
          <ModalProvider>
            <Actions environment={{ id: "env", name: "connect" }} />
          </ModalProvider>
        </DependencyProvider>
      </MemoryRouter>
    </StoreProvider>
  );

  return { component, apiHelper, store };
}

test("GIVEN Environment Actions and delete modal WHEN empty or wrong env THEN delete disabled", async () => {
  const { component } = setup();

  render(component);

  await userEvent.click(await screen.findByRole("button", { name: "Delete environment" }));

  expect(
    screen.getByRole<HTMLInputElement>("textbox", {
      name: "delete environment check",
    })
  ).toHaveFocus();

  const input = screen.getByRole<HTMLInputElement>("textbox", {
    name: "delete environment check",
  });
  const deleteButton = screen.getByRole("button", { name: "delete" });

  expect(input.value).toHaveLength(0);
  expect(deleteButton).toBeDisabled();

  await userEvent.type(input, "wrong");

  expect(input.value).toMatch("wrong");
  expect(deleteButton).toBeDisabled();
});

test("GIVEN Environment Actions and delete modal WHEN correct env THEN delete enabled", async () => {
  const { component } = setup();

  render(component);

  await userEvent.click(await screen.findByRole("button", { name: "Delete environment" }));

  const input = screen.getByRole<HTMLInputElement>("textbox", {
    name: "delete environment check",
  });
  const deleteButton = screen.getByRole("button", { name: "delete" });

  expect(input.value).toHaveLength(0);
  expect(deleteButton).toBeDisabled();

  await userEvent.type(input, "connect");

  expect(input.value).toMatch("connect");
  expect(deleteButton).toBeEnabled();
});

test("GIVEN Environment Actions and delete modal WHEN correct env & delete button pressed THEN delete executed", async () => {
  const { component, apiHelper } = setup();

  render(component);

  await userEvent.click(await screen.findByRole("button", { name: "Delete environment" }));

  const input = screen.getByRole<HTMLInputElement>("textbox", {
    name: "delete environment check",
  });

  const deleteButton = screen.getByRole("button", { name: "delete" });

  await userEvent.type(input, "connect");

  await userEvent.click(deleteButton);

  expect(apiHelper.pendingRequests).toHaveLength(1);
  const request = apiHelper.pendingRequests[0];

  expect(request).toEqual({
    method: "DELETE",
    environment: "env",
    url: "/api/v2/environment/env",
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

test("GIVEN Environment Actions and delete modal WHEN delete executed and error THEN error is shown", async () => {
  const { component, apiHelper } = setup();

  render(component);

  await userEvent.click(await screen.findByRole("button", { name: "Delete environment" }));

  const input = screen.getByRole<HTMLInputElement>("textbox", {
    name: "delete environment check",
  });

  await userEvent.type(input, "connect");

  await userEvent.click(screen.getByRole("button", { name: "delete" }));

  await act(async () => {
    await apiHelper.resolve(Maybe.some("error message"));
  });

  const errorAlert = screen.getByTestId("ErrorAlert");

  expect(within(errorAlert).getByText("error message")).toBeVisible();
});

test("GIVEN Environment Actions and delete modal WHEN form is valid and enter is pressed THEN delete is executed", async () => {
  const { component, apiHelper } = setup();

  render(component);

  await userEvent.click(await screen.findByRole("button", { name: "Delete environment" }));

  await userEvent.keyboard("connect{enter}");

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "DELETE",
    environment: "env",
    url: "/api/v2/environment/env",
  });
});

test("GIVEN Environment Actions and clear modal WHEN form is valid and enter is pressed THEN clear is executed", async () => {
  const { component, apiHelper } = setup();

  render(component);

  await userEvent.click(await screen.findByRole("button", { name: "Clear environment" }));

  await userEvent.keyboard("connect{enter}");

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "DELETE",
    environment: "env",
    url: "/api/v2/decommission/env",
  });
});

test("GIVEN Environment Actions and clear modal WHEN correct env & clear button pressed THEN clear is executed", async () => {
  const { component, apiHelper } = setup();

  render(component);

  await userEvent.click(await screen.findByRole("button", { name: "Clear environment" }));

  const input = screen.getByRole<HTMLInputElement>("textbox", {
    name: "clear environment check",
  });
  const clearButton = screen.getByRole("button", { name: "clear" });

  await userEvent.type(input, "connect");

  await userEvent.click(clearButton);

  expect(apiHelper.pendingRequests).toHaveLength(1);
  const request = apiHelper.pendingRequests[0];

  expect(request).toEqual({
    method: "DELETE",
    environment: "env",
    url: "/api/v2/decommission/env",
  });

  await act(async () => {
    await apiHelper.resolve(Maybe.none());
  });
  expect(apiHelper.resolvedRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests).toHaveLength(0);
});

test("GIVEN Environment Actions WHEN the environment is protected THEN clear and delete are disabled", async () => {
  const { component, store } = setup();

  store.dispatch.environment.setSettingsData({
    environment: "env",
    value: RemoteData.success({
      settings: {},
      definition: EnvironmentSettings.definition,
    }),
  });
  store.dispatch.environment.setEnvironmentDetailsById({
    id: "env",
    value: RemoteData.success({
      ...EnvironmentDetails.a,
      id: "env",
      settings: { protected_environment: true },
    }),
  });
  render(component);
  expect(await screen.findByRole("button", { name: "Clear environment" })).toBeDisabled();
  expect(await screen.findByRole("button", { name: "Delete environment" })).toBeDisabled();
});
