import { fireEvent, screen, render } from "@testing-library/react";
import React from "react";
import { SetStateAction } from "./SetStateAction";

test("SetStateAction dropdown is disabled when no targets are found", async () => {
  const id = "instanceId1";
  render(
    <SetStateAction
      id="instanceId1"
      targets={[]}
      onSetInstanceState={async () => {
        return;
      }}
    />
  );
  const testid = `${id}-set-state-toggle`;
  expect(await screen.findByTestId(testid)).toBeDisabled();
});

test("SetStateAction dropdown can be expanded", async () => {
  const id = "instanceId1";
  render(
    <SetStateAction
      id="instanceId1"
      targets={["acknowledged", "designed"]}
      onSetInstanceState={async () => {
        return;
      }}
    />
  );
  const testid = `${id}-set-state-toggle`;

  fireEvent.click(await screen.findByTestId(testid));

  expect(await screen.findByTestId(`${id}-acknowledged`)).toBeVisible();
  expect(await screen.findByTestId(`${id}-designed`)).toBeVisible();
});

test("SetStateAction shows confirmation dialog when element is selected", async () => {
  const id = "instanceId1";
  render(
    <SetStateAction
      id="instanceId1"
      targets={["acknowledged", "designed"]}
      onSetInstanceState={async () => {
        return;
      }}
    />
  );
  const testid = `${id}-set-state-toggle`;

  fireEvent.click(await screen.findByTestId(testid));
  fireEvent.click(await screen.findByTestId(`${id}-acknowledged`));

  expect(await screen.findByTestId(`${id}-set-state-modal`)).toBeVisible();
});

test("SetStateAction calls onSetInstanceState when transfer is confirmed", async () => {
  const id = "instanceId1";
  let called = 0;
  const onSetInstanceState = async () => {
    called += 1;
  };
  render(
    <SetStateAction
      id="instanceId1"
      targets={["acknowledged", "designed"]}
      onSetInstanceState={onSetInstanceState}
    />
  );
  const testid = `${id}-set-state-toggle`;

  fireEvent.click(await screen.findByTestId(testid));
  fireEvent.click(await screen.findByTestId(`${id}-acknowledged`));

  expect(await screen.findByTestId(`${id}-set-state-modal`)).toBeVisible();
  fireEvent.click(await screen.findByTestId(`${id}-set-state-modal-confirm`));
  expect(screen.queryByTestId(`${id}-set-state-modal`)).not.toBeInTheDocument();
  expect(called).toEqual(1);
});

test("SetStateAction closes confirmation modal when transfer is cancelled", async () => {
  const id = "instanceId1";
  let called = 0;
  const onSetInstanceState = async () => {
    called += 1;
  };
  render(
    <SetStateAction
      id="instanceId1"
      targets={["acknowledged", "designed"]}
      onSetInstanceState={onSetInstanceState}
    />
  );
  const testid = `${id}-set-state-toggle`;

  fireEvent.click(await screen.findByTestId(testid));
  fireEvent.click(await screen.findByTestId(`${id}-acknowledged`));

  expect(await screen.findByTestId(`${id}-set-state-modal`)).toBeVisible();
  fireEvent.click(await screen.findByTestId(`${id}-set-state-modal-cancel`));
  expect(screen.queryByTestId(`${id}-set-state-modal`)).not.toBeInTheDocument();
  expect(called).toEqual(0);
});

test("SetStateAction shows error message when transfer not successful", async () => {
  const id = "instanceId1";
  let called = 0;
  const onSetInstanceState = async (
    id: string,
    targetState: string,
    setErrorMessage: (string) => void
  ) => {
    called += 1;
    setErrorMessage("something happened");
  };
  render(
    <SetStateAction
      id="instanceId1"
      targets={["acknowledged", "designed"]}
      onSetInstanceState={onSetInstanceState}
    />
  );
  const testid = `${id}-set-state-toggle`;

  fireEvent.click(await screen.findByTestId(testid));
  fireEvent.click(await screen.findByTestId(`${id}-acknowledged`));

  // Modal is visible
  expect(await screen.findByTestId(`${id}-set-state-modal`)).toBeVisible();
  // Confirm transfer
  fireEvent.click(await screen.findByTestId(`${id}-set-state-modal-confirm`));
  expect(screen.queryByTestId(`${id}-set-state-modal`)).not.toBeInTheDocument();
  expect(called).toEqual(1);
  // Error message is shown
  expect(await screen.findByTestId(`${id}-error-message`)).toBeVisible();
  fireEvent.click(await screen.findByTestId(`${id}-close-error-message`));
  // Error message can be closed
  expect(screen.queryByTestId(`${id}-error-message`)).not.toBeInTheDocument();
});

test("SetStateAction shows no confirmation dialog when no callback was provided", async () => {
  const id = "instanceId1";
  render(
    <SetStateAction
      id="instanceId1"
      targets={["acknowledged", "designed"]}
      onSetInstanceState={null}
    />
  );
  const testid = `${id}-set-state-toggle`;

  fireEvent.click(await screen.findByTestId(testid));
  fireEvent.click(await screen.findByTestId(`${id}-acknowledged`));

  expect(screen.queryByTestId(`${id}-set-state-modal`)).not.toBeInTheDocument();
});
