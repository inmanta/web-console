import React, { act } from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { Either } from "@/Core";
import {
  CommandManagerResolverImpl,
  CommandResolverImpl,
  defaultAuthContext,
  getStoreInstance,
  QueryManagerResolverImpl,
  QueryResolverImpl,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  MockEnvironmentModifier,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { ModalProvider } from "@/UI/Root/Components/ModalProvider";
import { words } from "@/UI/words";
import { CatalogActions } from "./CatalogActions";
expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

function setup(
  details = {
    halted: false,
    server_compile: true,
    protected_environment: false,
    enable_lsm_expert_mode: false,
  },
) {
  const apiHelper = new DeferredApiHelper();

  const scheduler = new StaticScheduler();
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolverImpl(store, apiHelper, scheduler, scheduler),
  );
  const commandResolver = new CommandResolverImpl(
    new CommandManagerResolverImpl(store, apiHelper, defaultAuthContext),
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
        <ModalProvider>
          <CatalogActions />
        </ModalProvider>
      </DependencyProvider>
    </StoreProvider>
  );

  return { component, apiHelper, scheduler };
}

afterEach(cleanup);

test("Given CatalogUpdateButton, when user clicks on button, it should display a modal.", async () => {
  const { component } = setup();

  render(component);

  const button = screen.getByRole("button", {
    name: words("catalog.button.update"),
  });

  expect(button).toBeVisible();

  await userEvent.click(button);

  expect(
    await screen.findByText(words("catalog.update.modal.title")),
  ).toBeVisible();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("Given CatalogUpdateButton, when user cancels the modal, it should not fire the API call and close the modal.", async () => {
  const { component, apiHelper } = setup();

  render(component);

  const button = screen.getByRole("button", {
    name: words("catalog.button.update"),
  });

  await userEvent.click(button);

  const cancelButton = await screen.findByText(words("no"));

  expect(cancelButton).toBeVisible();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });

  await userEvent.click(cancelButton);

  expect(cancelButton).not.toBeVisible();
  expect(apiHelper.pendingRequests).toHaveLength(0);
  expect(apiHelper.resolvedRequests).toHaveLength(0);
});

test("Given CatalogUpdateButton, when user confirms update, it should fire the API call, if success, show a toaster on succes and close the modal.", async () => {
  const { component, apiHelper } = setup();

  render(component);

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });

  const button = screen.getByRole("button", {
    name: words("catalog.button.update"),
  });

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
    await screen.findByText(words("catalog.update.success")),
  ).toBeVisible();
});

test("Given CatalogUpdateButton, when user confirms the update, it should fire the API call, if failure, it should show an error toast and close the modal.", async () => {
  const { component, apiHelper } = setup();

  render(component);

  const button = screen.getByRole("button", {
    name: words("catalog.button.update"),
  });

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

test("Given API documentation button, it has the right href link.", async () => {
  const { component } = setup();

  render(component);

  const button = screen.getByRole("link", {
    name: "API-Documentation",
  });

  expect(button).toHaveAttribute(
    "href",
    "/lsm/v1/service_catalog_docs?environment=env",
  );
});
