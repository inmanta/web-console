interface BackendMetric {
  "lsm.service_count": (number | null)[];
  "orchestrator.compile_time": (number | null)[];
  "orchestrator.compile_waiting_time": (number | null)[];
  "orchestrator.compile_rate": (number | null)[];
  "resource.agent_count": ({
    up: number | null;
    down: number | null;
    paused?: number | null;
  } | null)[];
  "resource.resource_count": ({
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
  } | null)[];
  "lsm.service_instance_count": ({
    danger: number;
    info: number;
    no_label: number;
    success: number;
    warning: number;
  } | null)[];
}
export interface BackendMetricData {
  start: string;
  end: string;
  timestamps: string[];
  metrics: BackendMetric;
}
