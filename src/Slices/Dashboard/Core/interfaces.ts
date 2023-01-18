export type MetricName =
  | "lsm.service_counter"
  | "lsm.service_instance_count"
  | "orchestrator.compile_time"
  | "orchestrator.compile_waiting_time"
  | "orchestrator.compile_rate"
  | "resource.agent_count"
  | "resource.resource_count";
export interface Metric {
  name: string;
  data: number[];
}
export interface StackedMetric {
  name: string;
  data: { down: number; paused: number; up: number }[];
}
export interface LegendData {
  name: string;
  childName: string;
  symbol?: {
    fill: string;
  };
}
export interface GraphCardProps {
  isStacked: boolean;
  timestamps: string[];
  metrics: Metric | StackedMetric;
}
export interface LineChartProps {
  title: string;
  description: string;
  label: string;
  legendData: LegendData[];
  timestamps: string[];
  metrics: Metric[];
  minMax: number[];
  isStacked?: boolean;
}

export interface BackendMetric {
  "lsm.service_counter": (number | null)[];
  "orchestrator.compile_time": (number | null)[];
  "resource.agent_count": {
    up: number | null;
    down: number | null;
    paused: number | null;
  }[];
}
export interface BackendMetricData {
  start: string;
  end: string;
  timestamps: string[];
  metrics: BackendMetric;
}
