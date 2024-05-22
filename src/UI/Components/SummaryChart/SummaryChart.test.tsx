import assert from "assert";
import React from "react";
import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
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
  const spyDispatch = jest.spyOn(document, "dispatchEvent");
  render(
    <SummaryChart
      by_label={{ danger: 0, no_label: 0, warning: 0, info: 0, success: 0 }}
      total="0"
    />,
  );
  await act(async () => {
    await userEvent.click(screen.getByText("danger: 0"));
  });
  expect(spyDispatch).toHaveBeenCalledWith(
    new CustomEvent("group-filtering", { detail: "danger" }),
  );
});
