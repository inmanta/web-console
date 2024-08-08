import React from "react";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

const Bomb = () => {
  throw new Error("BOOM");
};

test("GIVEN ErrorBoundary WHEN no error is thrown THEN error page should NOT be shown.", () => {
  const consoleError = jest.spyOn(console, "error");

  const explode = false;

  const component = (
    <ErrorBoundary>
      <span data-testid="bomb">{explode ? <Bomb /> : "normal text"}</span>
    </ErrorBoundary>
  );

  render(component);

  expect(consoleError).not.toHaveBeenCalled();
});

test("GIVEN ErrorBoundary WHEN an error is thrown THEN error page should be shown.", async () => {
  // because we know we are throwing an unhandeled error here, we spy on the console error to avoid spamming the logs in the test-output.

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  jest.spyOn(console, "error").mockImplementation(() => {});

  const explode = true;

  const component = (
    <ErrorBoundary>
      <span data-testid="bomb">{explode ? <Bomb /> : "normal text"}</span>
    </ErrorBoundary>
  );

  render(component);

  expect(screen.getByText("BOOM")).toBeVisible();
});
