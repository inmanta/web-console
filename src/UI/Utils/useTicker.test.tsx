import React from "react";
import { act, render } from "@testing-library/react";
import {
  useTickerWithInterval,
  useTickerWithUnixMs,
  getDiffFromNow,
} from "./useTicker";

jest.useFakeTimers();

const ONE_SECOND = 1000;
const ONE_MINUTE = 60000;
const ONE_HOUR = 3600000;

test("GIVEN useTickerWithInterval WHEN provided with interval THEN executes at that interval", async () => {
  const callback = jest.fn();
  const Component: React.FC = () => {
    useTickerWithInterval("OneSecond");
    callback();
    return null;
  };
  render(<Component />);

  await act(async () => {
    await jest.advanceTimersByTime(ONE_SECOND);
  });

  expect(callback).toBeCalledTimes(2);
});

test("GIVEN useTickerWithUnixMs WHEN provided with timestamp longer than 1 hour ago THEN executes every minute", async () => {
  const callback = jest.fn();
  const value = new Date(Date.now() - 3 * ONE_HOUR).valueOf();

  const Component: React.FC = () => {
    useTickerWithUnixMs(value);
    callback();
    return null;
  };

  render(<Component />);

  await act(async () => {
    await jest.advanceTimersByTime(10 * ONE_MINUTE + 100);
  });

  expect(callback).toBeCalledTimes(2);
});

test("GIVEN useTickerWithUnixMs WHEN provided with timestamp less than 1 minute ago THEN executes every second until 1 minute is reached", async () => {
  const callback = jest.fn();
  const value = new Date(Date.now() - 50 * ONE_SECOND).valueOf();
  const Component: React.FC = () => {
    useTickerWithUnixMs(value);
    callback();
    return null;
  };
  render(<Component />);

  await act(async () => {
    await jest.advanceTimersByTime(9 * ONE_SECOND + 100);
  });

  expect(callback).toBeCalledTimes(2);

  await act(async () => {
    await jest.advanceTimersByTime(ONE_SECOND);
  });

  expect(callback).toBeCalledTimes(3);

  await act(async () => {
    await jest.advanceTimersByTime(10 * ONE_SECOND + 100);
  });

  expect(callback).toBeCalledTimes(4);
});

test("GIVEN getDiffFromNow WHEN provided with timestamp THEN returns correct millisecond difference", () => {
  const now = Date.now();
  const TEN_MINUTES_IN_MS = 600000;
  const value = new Date(now - TEN_MINUTES_IN_MS).valueOf();

  expect(getDiffFromNow(value, now)).toEqual(TEN_MINUTES_IN_MS);
});
