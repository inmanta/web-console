import React from "react";
import { render, screen } from "@testing-library/react";
import { words } from "@/UI";
import { MetricName } from "../Core/interfaces";
import { mockedMetrics } from "../Data/mockData";
import { GraphCard } from "./GraphCard";

describe("Test GraphCard with LineChart component", () => {
  it("Line Chart version", async () => {
    const availableKeys = Object.keys(mockedMetrics.metrics);
    const { container } = render(
      <GraphCard
        isStacked={false}
        timestamps={mockedMetrics.timestamps}
        metrics={{
          name: availableKeys[0],
          data: mockedMetrics.metrics[availableKeys[0]],
        }}
      />
    );

    expect(
      await screen.findByRole("heading", {
        name: words(`dashboard.${availableKeys[0] as MetricName}.title`),
      })
    ).toBeVisible();
    expect(await container.querySelector(".pf-c-chart")).toBeVisible();
  });
  it("Area Chart version", async () => {
    const availableKeys = Object.keys(mockedMetrics.metrics);
    const { container } = render(
      <GraphCard
        isStacked={true}
        timestamps={mockedMetrics.timestamps}
        metrics={{
          name: availableKeys[2],
          data: mockedMetrics.metrics[availableKeys[2]],
        }}
      />
    );

    expect(
      await screen.findByRole("heading", {
        name: words(`dashboard.${availableKeys[2] as MetricName}.title`),
      })
    ).toBeVisible();
    expect(await container.querySelector(".pf-c-chart")).toBeVisible();
  });
});
