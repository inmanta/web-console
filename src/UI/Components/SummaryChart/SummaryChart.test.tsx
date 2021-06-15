import { Service } from "@/Test";
import { render, screen } from "@testing-library/react";
import assert from "assert";
import React from "react";
import { SummaryChart } from "./SummaryChart";

test("SummaryChart renders with multiple instances", () => {
  assert(Service.withInstanceSummary.instance_summary);
  render(
    <SummaryChart
      by_label={Service.withInstanceSummary.instance_summary.by_label}
      total={Service.withInstanceSummary.instance_summary.total}
    />
  );
  expect(
    screen.getByRole("img", { name: "Number of instances by label" })
  ).toBeVisible();
});

test("SummaryChart renders with no instances", () => {
  render(
    <SummaryChart
      by_label={{ danger: 0, no_label: 0, warning: 0, info: 0, success: 0 }}
      total={0}
    />
  );
  expect(
    screen.getByRole("img", { name: "Number of instances by label" })
  ).toBeVisible();
});
