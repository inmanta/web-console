import { BackendMetricData } from "@/Slices/Dashboard/Core/Domain";
import { average, deriveNbDatapoints, getTrendSeries } from "./orchestrationEngineMetrics";

const metrics: BackendMetricData = {
  start: "2023-01-01T00:00:00",
  end: "2023-01-08T00:00:00",
  timestamps: ["2023-01-01T00:00:00", "2023-01-02T00:00:00", "2023-01-03T00:00:00"],
  metrics: {
    "lsm.service_count": [],
    "lsm.service_instance_count": [],
    "resource.agent_count": [],
    "resource.resource_count": [],
    "orchestrator.compile_rate": [2, null, 6],
    "orchestrator.compile_time": [40, null, 60],
    "orchestrator.compile_waiting_time": [4, 8, null],
  },
};

describe("getTrendSeries", () => {
  it("zero-fills null datapoints and reports the max of the selected tab's metric", () => {
    expect(getTrendSeries(metrics, "rate")).toEqual({ data: [2, 0, 6], max: 6 });
    expect(getTrendSeries(metrics, "time")).toEqual({ data: [40, 0, 60], max: 60 });
    expect(getTrendSeries(metrics, "waiting")).toEqual({ data: [4, 8, 0], max: 8 });
  });

  it("returns an empty series when metrics haven't loaded yet", () => {
    expect(getTrendSeries(undefined, "rate")).toEqual({ data: [], max: 0 });
  });
});

describe("average", () => {
  it("averages only the non-null datapoints", () => {
    expect(average([40, null, 60])).toEqual(50);
    expect(average([4, 8, null])).toEqual(6);
  });

  it("returns null when every datapoint is null or the list is empty", () => {
    expect(average([null, null])).toBeNull();
    expect(average([])).toBeNull();
    expect(average(undefined)).toBeNull();
  });
});

describe("deriveNbDatapoints", () => {
  it("scales proportionally to the established 15-points-over-7-days density", () => {
    expect(deriveNbDatapoints(7)).toEqual(15);
    expect(deriveNbDatapoints(14)).toEqual(30);
    expect(deriveNbDatapoints(30)).toEqual(64);
  });
});
