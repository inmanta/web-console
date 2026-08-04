import React from "react";
import { render, screen } from "@testing-library/react";
import { TrendChart } from "./TrendChart";

// jsdom reports 0 for layout measurements, and the chart only renders once its container has a
// measured width (see the resize-driven `width` state in TrendChart) - stub it so the chart
// actually mounts, matching how the old Dashboard's LineChart.test.tsx-equivalent (GraphCard)
// exercises a real Victory chart rather than mocking the library away.
beforeEach(() => {
  Element.prototype.getBoundingClientRect = () =>
    ({ width: 600, height: 160, top: 0, left: 0, right: 600, bottom: 160, x: 0, y: 0 }) as DOMRect;
});

const data = [10, 20, 30, 40];
const timestamps = [
  "2024-01-01T00:00:00",
  "2024-01-02T00:00:00",
  "2024-01-03T00:00:00",
  "2024-01-04T00:00:00",
];

function setup() {
  return render(
    <TrendChart
      data={data}
      timestamps={timestamps}
      max={40}
      color="#000000"
      formatValue={(value) => `${value}s`}
      xStartLabel="7 days ago"
      xEndLabel="Today"
      ariaLabel="Test chart"
    />
  );
}

describe("TrendChart", () => {
  it("renders the chart", () => {
    setup();

    expect(screen.getByRole("img")).toBeVisible();
  });

  it("labels the x axis with the start/end range labels and the y axis with 0/max", () => {
    setup();

    expect(screen.getByText("7 days ago")).toBeVisible();
    expect(screen.getByText("Today")).toBeVisible();
    expect(screen.getByText("0s")).toBeVisible();
    expect(screen.getByText("40s")).toBeVisible();
  });
});
