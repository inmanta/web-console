import React from "react";
import { render, screen, act, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
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
import { words } from "@/UI/words";
import { CatalogUpdateButton } from "./CatalogUpdateButton";

function setup(
  details = {
    halted: false,
    server_compile: true,
    protected_environment: false,
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
        <CatalogUpdateButton />
      </DependencyProvider>
    </StoreProvider>
  );
  return { component, apiHelper, scheduler };
}

afterEach(cleanup);

test("Given CatalogUpdateButton, when user clicks on button, it should display a modal.", async () => {
  const { component } = setup();
  render(component);

  const button = screen.getByRole("button", { name: "Update Service Catalog" });

  expect(button).toBeVisible();
  await userEvent.click(button);

  expect(
    await screen.findByText(words("catalog.update.modal.title"))
  ).toBeVisible();
});

test("Given CatalogUpdateButton, when user cancels the modal, it should not fire the API call and close the modal.", async () => {
  const { component, apiHelper } = setup();
  render(component);

  const button = screen.getByRole("button", { name: "Update Service Catalog" });
  await userEvent.click(button);
  const cancelButton = await screen.findByText(words("no"));
  expect(cancelButton).toBeVisible();

  await userEvent.click(cancelButton);
  expect(cancelButton).not.toBeVisible();

  expect(apiHelper.pendingRequests).toHaveLength(0);
  expect(apiHelper.resolvedRequests).toHaveLength(0);
});

test("Given CatalogUpdateButton, when user confirms update, it should fire the API call, if success, show a toaster on succes and close the modal.", async () => {
  const { component, apiHelper } = setup();
  render(component);

  const button = screen.getByRole("button", { name: "Update Service Catalog" });
  await userEvent.click(button);
  const confirmButton = await screen.findByText(words("yes"));
  expect(confirmButton).toBeVisible();

  await userEvent.click(confirmButton);
  expect(confirmButton).not.toBeVisible();

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "POST",
    url: "/lsm/v1/exporter/export_service_definition",
    body: null,
    environment: "env",
  });

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: "id" }));
  });

  expect(
    await screen.findByText("The update has been requested")
  ).toBeVisible();
});

test("Given CatalogUpdateButton, when user confirms the update, it should fire the API call, if failure, it should show an error toast and close the modal.", async () => {
  const { component, apiHelper } = setup();
  render(component);

  const button = screen.getByRole("button", { name: "Update Service Catalog" });
  await userEvent.click(button);
  const confirmButton = await screen.findByText(words("yes"));
  expect(confirmButton).toBeVisible();

  await userEvent.click(confirmButton);
  expect(confirmButton).not.toBeVisible();

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "POST",
    url: "/lsm/v1/exporter/export_service_definition",
    body: null,
    environment: "env",
  });

  await act(async () => {
    await apiHelper.resolve(Either.left("Something went wrong"));
  });

  expect(await screen.findByText("Something went wrong")).toBeVisible();
});
