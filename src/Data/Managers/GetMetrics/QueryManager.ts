import { identity } from "lodash-es";
import { ApiHelper, StateHelperWithEnv } from "@/Core";
import { QueryManager } from "../Helpers";

export function GetMetricsQueryManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelperWithEnv<"GetMetrics">,
) {
  return QueryManager.OneTimeWithEnv<"GetMetrics">(
    apiHelper,
    stateHelper,
    ({ startDate, endDate }, environment) => [startDate, endDate, environment],
    "GetMetrics",
    ({ startDate, endDate, isLsmAvailable }) => {
      const lsmMetrics =
        "metrics=lsm.service_count&metrics=lsm.service_instance_count&";
      return `/api/v2/metrics?${
        isLsmAvailable ? lsmMetrics : ""
      }metrics=orchestrator.compile_time&metrics=orchestrator.compile_waiting_time&metrics=orchestrator.compile_rate&metrics=resource.agent_count&metrics=resource.resource_count&start_interval=${startDate}&end_interval=${endDate}&nb_datapoints=15&round_timestamps=true`;
    },
    identity,
  );
}
