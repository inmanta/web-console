import React from "react";
import { act, render } from "@testing-library/react";
import { useTickerWithInterval, useTickerWithTimestamp } from "./useTicker";

jest.useFakeTimers();

test("GIVEN useTickerWithInterval WHEN provided with interval THEN executes at that interval", () => {
  const callback = jest.fn();
  const Component: React.FC = () => {
    useTickerWithInterval("OneSecond");
    callback();
    return null;
  };
  render(<Component />);

  act(() => {
    jest.advanceTimersByTime(1000);
  });

  expect(callback).toBeCalledTimes(2);
});

test("GIVEN useTickerWithTimestamp WHEN provided with timestamp longer than 2 hours ago THEN never executes again", () => {
  const callback = jest.fn();
  const THREE_HOURS = 10800000;
  const timestamp = new Date(Date.now() - THREE_HOURS).toISOString();
  const Component: React.FC = () => {
    useTickerWithTimestamp(timestamp);
    callback();
    return null;
  };
  render(<Component />);

  act(() => {
    jest.advanceTimersByTime(THREE_HOURS);
  });

  expect(callback).toBeCalledTimes(1);
});

test("GIVEN useTickerWithTimestamp WHEN provided with timestamp less than 10 seconds ago THEN executes every second until 10 is reached", () => {
  const callback = jest.fn();
  const EIGHT_SECONDS = 8000;
  const timestamp = new Date(Date.now() - EIGHT_SECONDS).toISOString();
  const Component: React.FC = () => {
    useTickerWithTimestamp(timestamp);
    callback();
    return null;
  };
  render(<Component />);

  act(() => {
    jest.advanceTimersByTime(5000);
  });

  expect(callback).toBeCalledTimes(3);

  act(() => {
    jest.advanceTimersByTime(3000);
  });

  expect(callback).toBeCalledTimes(4);
});
