import React from "react";
import { MemoryRouter } from "react-router-dom";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Either, Maybe } from "@/Core";
import {
  CommandResolverImpl,
  getStoreInstance,
  QueryResolverImpl,
  CommandManagerResolver,
  QueryManagerResolver,
  KeycloakAuthHelper,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  Project,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI";
import { DeleteModal } from "./DeleteModal";

function setup() {
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

  const onClose = jest.fn();

  const component = (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{ ...dependencies, queryResolver, commandResolver }}
      >
        <DeleteModal
          isOpen
          onClose={onClose}
          environment={{ id: "abcd", name: "connect" }}
        />
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, apiHelper, onClose };
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

  await userEvent.type(input, "wrong");
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

  await userEvent.type(input, "connect");
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
  await userEvent.type(input, "connect");
  await userEvent.click(deleteButton);
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
  await userEvent.type(input, "connect");
  await userEvent.click(screen.getByRole("button", { name: "Delete" }));
  await act(async () => {
    await apiHelper.resolve(Maybe.some("error message"));
  });
  const errorAlert = screen.getByRole("generic", {
    name: "Environment Error Alert",
  });
  expect(within(errorAlert).getByText("error message")).toBeVisible();
});

test("GIVEN DeleteModal WHEN enter is pressed and form is invalid THEN modal is not closed", async () => {
  const { component, onClose } = setup();
  render(component);
  await userEvent.keyboard("{enter}");
  expect(onClose).not.toBeCalled();
});

test("GIVEN DeleteModal THEN focus is on the input field", async () => {
  const { component } = setup();
  render(component);
  expect(
    screen.getByRole<HTMLInputElement>("textbox", {
      name: "Delete Environment Check",
    })
  ).toHaveFocus();
});

test("GIVEN DeleteModal WHEN form is valid and enter is pressed THEN delete is executed", async () => {
  const { component, apiHelper } = setup();
  render(component);
  await userEvent.keyboard("connect{enter}");
  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "DELETE",
    environment: "abcd",
    url: "/api/v2/environment/abcd",
  });
});
