import React from "react";
import { MemoryRouter } from "react-router-dom";
import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import {
  CommandResolverImpl,
  getStoreInstance,
  QueryResolverImpl,
  CommandManagerResolverImpl,
  QueryManagerResolverImpl,
  KeycloakAuthHelper,
} from "@/Data";
import { DeferredApiHelper, dependencies, StaticScheduler } from "@/Test";
import { DependencyProvider } from "@/UI";
import { ConfirmationModal } from "./ConfirmationModal";

function setup() {
  const apiHelper = new DeferredApiHelper();
  const authHelper = new KeycloakAuthHelper();
  const scheduler = new StaticScheduler();
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolverImpl(store, apiHelper, scheduler, scheduler),
  );
  const commandResolver = new CommandResolverImpl(
    new CommandManagerResolverImpl(store, apiHelper, authHelper),
  );

  const onClose = jest.fn();
  const onConfirm = jest.fn();

  const component = (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{ ...dependencies, queryResolver, commandResolver }}
      >
        <ConfirmationModal
          actionType="delete"
          isOpen
          onClose={onClose}
          environment="connect"
          onConfirm={onConfirm}
        />
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, apiHelper, onClose };
}

test("GIVEN ConfirmationModal WHEN enter is pressed and form is invalid THEN modal is not closed", async () => {
  const { component, onClose } = setup();
  await render(component);
  await act(async () => {
    await userEvent.keyboard("{enter}");
  });
  expect(onClose).not.toBeCalled();
});

test("GIVEN ConfirmationModal THEN focus is on the input field", async () => {
  const { component } = setup();
  await render(component);
  expect(
    screen.getByRole<HTMLInputElement>("textbox", {
      name: "delete environment check",
    }),
  ).toHaveFocus();
});
