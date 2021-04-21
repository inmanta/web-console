import { flushPromises } from "@/Test";
import { SchedulerImpl } from "./SchedulerImpl";

jest.useFakeTimers();

// https://stackoverflow.com/questions/52177631/jest-timer-and-promise-dont-work-well-settimeout-and-async-function

test("Scheduler", async () => {
  const scheduler = new SchedulerImpl(5000);

  const taskA = {
    effect: jest.fn(async () => undefined),
    update: jest.fn(),
  };

  const taskB = {
    effect: jest.fn(async () => undefined),
    update: jest.fn(),
  };

  scheduler.register("taskA", taskA);

  expect(taskA.effect).not.toBeCalled();

  jest.advanceTimersByTime(1000);

  expect(taskA.effect).not.toBeCalled();

  jest.advanceTimersByTime(4000);

  await flushPromises();

  expect(taskA.effect).toHaveBeenCalledTimes(1);
  expect(taskA.update).toHaveBeenCalledTimes(1);

  scheduler.register("taskB", taskB);

  expect(taskB.effect).not.toBeCalled();

  jest.advanceTimersByTime(5000);

  await flushPromises();

  expect(taskA.effect).toHaveBeenCalledTimes(2);
  expect(taskA.update).toHaveBeenCalledTimes(2);
  expect(taskB.effect).toHaveBeenCalledTimes(1);
  expect(taskB.update).toHaveBeenCalledTimes(1);
});
