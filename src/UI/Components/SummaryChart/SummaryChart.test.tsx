import assert from "assert";
import React from "react";
import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { LabelContext } from "@/Slices/ServiceInventory/UI/ServiceInventory";
import { Service } from "@/Test";
import { words } from "@/UI/words";
import { SummaryChart } from "./SummaryChart";

test("SummaryChart renders with multiple instances", () => {
  assert(Service.withInstanceSummary.instance_summary);
  render(
    <SummaryChart
      by_label={Service.withInstanceSummary.instance_summary.by_label}
      total={Service.withInstanceSummary.instance_summary.total.toString()}
    />,
  );
  expect(
    screen.getByRole("img", { name: words("catalog.summary.title") }),
  ).toBeVisible();
});

test("SummaryChart renders with no instances", () => {
  render(
    <SummaryChart
      by_label={{ danger: 0, no_label: 0, warning: 0, info: 0, success: 0 }}
      total="0"
    />,
  );
  expect(
    screen.getByRole("img", { name: words("catalog.summary.title") }),
  ).toBeVisible();
});

test("SummaryChart renders with no instances", async () => {
  const testFn = jest.fn();
  render(
    <LabelContext.Provider
      value={{
        danger: ["test1"],
        warning: ["test2"],
        success: [],
        info: [],
        no_label: [],
        onClick: testFn,
      }}
    >
      <SummaryChart
        by_label={{ danger: 0, no_label: 0, warning: 0, info: 0, success: 0 }}
        total="0"
      />
      ,
    </LabelContext.Provider>,
  );
  await act(async () => {
    await userEvent.click(screen.getByText("danger: 0"));
  });

  expect(testFn).toHaveBeenCalledTimes(1);
  expect(testFn).toHaveBeenCalledWith(["test1"]);

  await act(async () => {
    await userEvent.click(screen.getByText("success: 0"));
  });

  expect(testFn).toHaveBeenCalledTimes(1);

  await act(async () => {
    await userEvent.click(screen.getByText("warning: 0"));
  });

  expect(testFn).toHaveBeenCalledTimes(2);
  expect(testFn).toHaveBeenCalledWith(["test2"]);
});
