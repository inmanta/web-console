import { Metric } from "../Core/Domain";
import { mockedMetrics } from "../Core/Mock";
import { alignTooltipLegendData, formatLegendData, formatMetricsToStacked } from "./helper";

// Widened to `string` so indexing BackendMetric falls back to `any`, same as the existing
// pattern in GraphCard.test.tsx — the literal key type doesn't structurally match StackedMetric.
const metricKey: string = "lsm.service_instance_count";

describe("alignTooltipLegendData", () => {
  // Regression test: on stacked dashboard charts, the hover tooltip showed the wrong count
  // next to a label (e.g. the "danger" color/count next to the "Success" label). This was
  // caused by ChartStack rendering its series in reverse order while ChartLegendTooltip kept
  // pairing hover values to legendData in the original order, so index i of the rendered
  // stack no longer matched index i of the tooltip's legend.
  it("keeps stacked metrics and tooltip legend data paired index-for-index", () => {
    const metrics = {
      name: metricKey,
      data: mockedMetrics.metrics[metricKey],
    };

    const [formattedMetrics] = formatMetricsToStacked(metrics, true) as [Metric[], number];
    const legendData = formatLegendData(metrics, true);

    const [stackedMetrics, tooltipLegendData] = alignTooltipLegendData(
      formattedMetrics,
      legendData,
      true
    );

    expect(stackedMetrics.map(({ name }) => name)).toEqual(
      tooltipLegendData.map(({ childName }) => childName)
    );

    const successIndex = stackedMetrics.findIndex(({ name }) => name === "success");

    expect(successIndex).toBeGreaterThanOrEqual(0);
    expect(tooltipLegendData[successIndex].childName).toBe("success");
  });

  it("does not mutate the original metrics/legendData arrays", () => {
    const metrics = {
      name: metricKey,
      data: mockedMetrics.metrics[metricKey],
    };

    const [formattedMetrics] = formatMetricsToStacked(metrics, true) as [Metric[], number];
    const legendData = formatLegendData(metrics, true);

    const originalMetricsOrder = formattedMetrics.map(({ name }) => name);
    const originalLegendOrder = legendData.map(({ childName }) => childName);

    alignTooltipLegendData(formattedMetrics, legendData, true);

    expect(formattedMetrics.map(({ name }) => name)).toEqual(originalMetricsOrder);
    expect(legendData.map(({ childName }) => childName)).toEqual(originalLegendOrder);
  });

  it("returns the inputs unchanged when the chart is not stacked", () => {
    const metrics = [{ name: "orchestrator.compile_rate", data: [1, 2, 3] }];
    const legendData = [{ childName: "orchestrator.compile_rate", name: "Compile rate" }];

    const [resultMetrics, resultLegendData] = alignTooltipLegendData(metrics, legendData, false);

    expect(resultMetrics).toBe(metrics);
    expect(resultLegendData).toBe(legendData);
  });
});
