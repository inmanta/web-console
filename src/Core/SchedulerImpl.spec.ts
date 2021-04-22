import { flushPromises } from "@/Test";
import { SchedulerImpl } from "./SchedulerImpl";

jest.useFakeTimers();

// https://stackoverflow.com/questions/52177631/jest-timer-and-promise-dont-work-well-settimeout-and-async-function

test("GIVEN a Scheduler WHEN registering a task after a cycle THEN executes all registered tasks", async () => {
  const scheduler = new SchedulerImpl(5000);
  const taskA = { effect: jest.fn(async () => undefined), update: jest.fn() };
  const taskB = { effect: jest.fn(async () => undefined), update: jest.fn() };

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

test("Given a Scheduler WHEN unregistering a task before the first cycle THEN the task is not executed", async () => {
  const scheduler = new SchedulerImpl(5000);
  const taskA = { effect: jest.fn(async () => undefined), update: jest.fn() };

  scheduler.register("taskA", taskA);

  expect(taskA.effect).not.toBeCalled();
  expect(taskA.update).not.toBeCalled();

  jest.advanceTimersByTime(4999);

  expect(taskA.effect).not.toBeCalled();
  expect(taskA.update).not.toBeCalled();

  scheduler.unregister("taskA");
  jest.advanceTimersByTime(1);

  expect(taskA.effect).not.toBeCalled();
  expect(taskA.update).not.toBeCalled();

  jest.advanceTimersByTime(5000);

  expect(taskA.effect).not.toBeCalled();
  expect(taskA.update).not.toBeCalled();
});

test("GIVEN a Scheduler WHEN unregistering a task during a cycle THEN the task is not executed at the end of that cycle", async () => {
  const scheduler = new SchedulerImpl(5000);
  const taskA = { effect: jest.fn(async () => undefined), update: jest.fn() };

  scheduler.register("taskA", taskA);

  expect(taskA.effect).not.toBeCalled();
  expect(taskA.update).not.toBeCalled();

  jest.advanceTimersByTime(5000);
  await flushPromises();

  expect(taskA.effect).toHaveBeenCalledTimes(1);
  expect(taskA.update).toHaveBeenCalledTimes(1);

  scheduler.unregister("taskA");
  jest.advanceTimersByTime(5000);
  await flushPromises();

  expect(taskA.effect).toHaveBeenCalledTimes(1);
  expect(taskA.update).toHaveBeenCalledTimes(1);
});

test("GIVEN a Scheduler WHEN unregistering the first task THEN the first task is not executed but the remaining tasks are executed", async () => {
  const scheduler = new SchedulerImpl(5000);
  const taskA = { effect: jest.fn(async () => undefined), update: jest.fn() };
  const taskB = { effect: jest.fn(async () => undefined), update: jest.fn() };

  scheduler.register("taskA", taskA);
  scheduler.register("taskB", taskB);

  expect(taskA.effect).not.toBeCalled();
  expect(taskA.update).not.toBeCalled();
  expect(taskB.effect).not.toBeCalled();
  expect(taskB.update).not.toBeCalled();

  jest.advanceTimersByTime(5000);
  await flushPromises();

  expect(taskA.effect).toHaveBeenCalledTimes(1);
  expect(taskA.update).toHaveBeenCalledTimes(1);
  expect(taskB.effect).toHaveBeenCalledTimes(1);
  expect(taskB.update).toHaveBeenCalledTimes(1);

  scheduler.unregister("taskA");
  jest.advanceTimersByTime(5000);
  await flushPromises();

  expect(taskA.effect).toHaveBeenCalledTimes(1);
  expect(taskA.update).toHaveBeenCalledTimes(1);
  expect(taskB.effect).toHaveBeenCalledTimes(2);
  expect(taskB.update).toHaveBeenCalledTimes(2);
});
