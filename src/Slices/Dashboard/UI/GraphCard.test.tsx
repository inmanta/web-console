import React from "react";
import { render, screen } from "@testing-library/react";
import { words } from "@/UI";
import { MetricName } from "../Core/Domain";
import { mockedMetrics } from "../Core/Mock";
import { GraphCard } from "./GraphCard";

describe("Test GraphCard with LineChart component", () => {
  it("Line Chart version", async () => {
    const availableKeys = Object.keys(mockedMetrics.metrics);
    const { container } = render(
      <GraphCard
        isStacked={false}
        timestamps={mockedMetrics.timestamps}
        metrics={{
          name: availableKeys[1],
          data: mockedMetrics.metrics[availableKeys[1]],
        }}
      />,
    );

    expect(
      await screen.findByRole("heading", {
        name: words(`dashboard.${availableKeys[1] as MetricName}.title`),
      }),
    ).toBeVisible();
    expect(await container.querySelector(".pf-v5-c-chart")).toBeVisible();
  });

  it("Area Chart version", async () => {
    const availableKeys = Object.keys(mockedMetrics.metrics);
    const { container } = render(
      <GraphCard
        isStacked={true}
        timestamps={mockedMetrics.timestamps}
        metrics={{
          name: availableKeys[6],
          data: mockedMetrics.metrics[availableKeys[6]],
        }}
      />,
    );
    expect(
      await screen.findByRole("heading", {
        name: words(`dashboard.${availableKeys[6] as MetricName}.title`),
      }),
    ).toBeVisible();
    expect(await container.querySelector(".pf-v5-c-chart")).toBeVisible();
  });
});
