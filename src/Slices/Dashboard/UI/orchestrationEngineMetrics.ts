import { BackendMetricData } from "@/Slices/Dashboard/Core/Domain";

export type OrchestrationEngineTab = "rate" | "time" | "waiting";

export interface TrendSeries {
  data: number[];
  max: number;
}

const getRawSeries = (
  metrics: BackendMetricData | undefined,
  tab: OrchestrationEngineTab
): (number | null)[] => {
  if (!metrics) {
    return [];
  }

  switch (tab) {
    case "rate":
      return metrics.metrics["orchestrator.compile_rate"];
    case "time":
      return metrics.metrics["orchestrator.compile_time"];
    case "waiting":
      return metrics.metrics["orchestrator.compile_waiting_time"];
  }
};

/**
 * The trend line's datapoints for the selected tab. Null datapoints (no compiles in that
 * interval) are rendered as 0 rather than as a gap, so a broken line would read as a rendering
 * glitch rather than "no data".
 */
export const getTrendSeries = (
  metrics: BackendMetricData | undefined,
  tab: OrchestrationEngineTab
): TrendSeries => {
  const data = getRawSeries(metrics, tab).map((value) => value ?? 0);

  return { data, max: data.length > 0 ? Math.max(...data) : 0 };
};

/**
 * Mean of a metric's non-null datapoints over the fetched window - null (no compiles that
 * interval) is excluded rather than counted as 0, so a quiet interval doesn't drag the average
 * down.
 */
export const average = (values: (number | null)[] | undefined): number | null => {
  const nonNull = (values ?? []).filter((value): value is number => value !== null);

  return nonNull.length === 0
    ? null
    : nonNull.reduce((sum, value) => sum + value, 0) / nonNull.length;
};

// The 7-day range's own 15 datapoints (~2.1/day) is the established baseline (matches the V1
// Dashboard's fixed nb_datapoints=15 for its own fixed 7-day window) - scaling it proportionally
// keeps that same point-per-day density as the selectable range grows to 14 or 30 days, rather
// than showing an equally-coarse 15 points stretched over a month.
const DATAPOINTS_PER_DAY = 15 / 7;

export const deriveNbDatapoints = (days: number): number => Math.round(days * DATAPOINTS_PER_DAY);
