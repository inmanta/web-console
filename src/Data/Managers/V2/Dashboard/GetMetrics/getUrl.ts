import { GetMetricsParams } from "./useGetMetrics";

export const getUrl = (params: GetMetricsParams) => {
  const lsmMetrics = "metrics=lsm.service_count&metrics=lsm.service_instance_count&";

  return `/api/v2/metrics?${
    params.isLsmAvailable ? lsmMetrics : ""
  }metrics=orchestrator.compile_time&metrics=orchestrator.compile_waiting_time&metrics=orchestrator.compile_rate&metrics=resource.agent_count&metrics=resource.resource_count&start_interval=${params.startDate}&end_interval=${params.endDate}&nb_datapoints=15&round_timestamps=true`;
};
