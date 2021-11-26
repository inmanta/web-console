import React from "react";
import { act, render } from "@testing-library/react";
import {
  useTickerWithInterval,
  useTickerWithTimestamp,
  getDiffFromNow,
} from "./useTicker";

jest.useFakeTimers();

const ONE_SECOND = 1000;
const ONE_MINUTE = 60000;
const ONE_HOUR = 3600000;

test("GIVEN useTickerWithInterval WHEN provided with interval THEN executes at that interval", () => {
  const callback = jest.fn();
  const Component: React.FC = () => {
    useTickerWithInterval("OneSecond");
    callback();
    return null;
  };
  render(<Component />);

  act(() => {
    jest.advanceTimersByTime(ONE_SECOND);
  });

  expect(callback).toBeCalledTimes(2);
});

test("GIVEN useTickerWithTimestamp WHEN provided with timestamp longer than 1 hour ago THEN executes every minute", () => {
  const callback = jest.fn();
  const timestamp = new Date(Date.now() - 3 * ONE_HOUR).toISOString();
  const Component: React.FC = () => {
    useTickerWithTimestamp(timestamp);
    callback();
    return null;
  };
  render(<Component />);

  act(() => {
    jest.advanceTimersByTime(10 * ONE_MINUTE + 100);
  });

  expect(callback).toBeCalledTimes(11);
});

test("GIVEN useTickerWithTimestamp WHEN provided with timestamp less than 1 minute ago THEN executes every second until 1 minute is reached", () => {
  const callback = jest.fn();
  const timestamp = new Date(Date.now() - 50 * ONE_SECOND).toISOString();
  const Component: React.FC = () => {
    useTickerWithTimestamp(timestamp);
    callback();
    return null;
  };
  render(<Component />);

  act(() => {
    jest.advanceTimersByTime(9 * ONE_SECOND + 100);
  });

  expect(callback).toBeCalledTimes(10);

  act(() => {
    jest.advanceTimersByTime(ONE_SECOND);
  });

  expect(callback).toBeCalledTimes(11);

  act(() => {
    jest.advanceTimersByTime(10 * ONE_SECOND + 100);
  });

  expect(callback).toBeCalledTimes(12);
});

test("GIVEN getDiffFromNow WHEN provided with timestamp THEN returns correct millisecond difference", () => {
  const now = Date.now();
  const TEN_MINUTES_IN_MS = 600000;
  const timestamp = new Date(now - TEN_MINUTES_IN_MS).toISOString();
  const serverTimestamp = timestamp.split("Z")[0];

  expect(getDiffFromNow(serverTimestamp, now)).toEqual(TEN_MINUTES_IN_MS);
});
