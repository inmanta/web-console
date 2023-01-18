import { BackendMetricData } from "../Core/interfaces";

export const mockedMetrics: BackendMetricData = {
  start: "2022-12-19T13:03:17.626169",
  end: "2023-01-09T13:06:35.108092",
  timestamps: [
    "2022-12-23T17:51:57.122554",
    "2022-12-27T22:40:36.618939",
    "2023-01-01T03:29:16.115324",
    "2023-01-05T08:17:55.611709",
    "2023-01-09T13:06:35.108092",
  ],
  metrics: {
    "lsm.service_counter": [19, 12, 27, 14, 26],
    "orchestrator.compile_time": [
      4.746683297273438, 4.148328795206461, 4.993011712015688,
      4.207690308591545, 4.447851157160551,
    ],
    "resource.agent_count": [
      {
        up: 4,
        down: 0,
        paused: 2,
      },
      {
        up: 8,
        down: 1,
        paused: 2,
      },
      {
        up: 6,
        down: 1,
        paused: 2,
      },
      {
        up: 6,
        down: 0,
        paused: 1,
      },
      {
        up: 6,
        down: 2,
        paused: 0,
      },
    ],
  },
};
