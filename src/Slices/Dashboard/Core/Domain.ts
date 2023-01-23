export type MetricName =
  | "lsm.service_count"
  | "lsm.service_instance_count"
  | "orchestrator.compile_time"
  | "orchestrator.compile_waiting_time"
  | "orchestrator.compile_rate"
  | "resource.agent_count"
  | "resource.resource_count";
export interface Metric {
  name: string;
  data: (number | null)[];
}
export interface StackedMetric {
  name: string;
  data: (
    | { down: number; paused: number; up: number }
    | {
        available: number;
        cancelled: number;
        deployed: number;
        deploying: number;
        dry: number;
        failed: number;
        skipped: number;
        skipped_for_undefined: number;
        unavailable: number;
        undefined: number;
      }
    | null
  )[];
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
  max: number;
  isStacked?: boolean;
}

export interface BackendMetric {
  "lsm.service_count": (number | null)[];
  "orchestrator.compile_time": (number | null)[];
  "orchestrator.compile_waiting_time": (number | null)[];
  "orchestrator.compile_rate": (number | null)[];
  "resource.agent_count": {
    up: number | null;
    down: number | null;
    paused?: number | null;
  }[];
  "resource.resource_count": {
    skipped?: number;
    deploying?: number;
    undefined?: number;
    available?: number;
    cancelled?: number;
    skipped_for_undefined?: number;
    unavailable?: number;
    dry?: number;
    failed?: number;
    deployed?: number;
  }[];
}
export interface BackendMetricData {
  start: string;
  end: string;
  timestamps: string[];
  metrics: BackendMetric;
}
