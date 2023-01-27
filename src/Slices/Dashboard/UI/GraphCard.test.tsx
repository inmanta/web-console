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
          name: availableKeys[4],
          data: mockedMetrics.metrics[availableKeys[4]],
        }}
      />
    );

    expect(
      await screen.findByRole("heading", {
        name: words(`dashboard.${availableKeys[4] as MetricName}.title`),
      })
    ).toBeVisible();
    expect(await container.querySelector(".pf-c-chart")).toBeVisible();
  });
});
