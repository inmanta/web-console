import { identity } from "lodash-es";
import { ApiHelper, Scheduler, StateHelper } from "@/Core";
import { QueryManager } from "../Helpers";

export function GetMetricsContinuousQueryManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelper<"GetMetrics">,
  scheduler: Scheduler
) {
  return QueryManager.ContinuousWithEnv<"GetMetrics">(
    apiHelper,
    stateHelper,
    scheduler,
    ({ kind }) => kind,
    () => [],
    "GetMetrics",
    () =>
      `/lsm/v2/metrics/?metrics=lsm.service_count&metrics=orchestrator.compile_time&metrics=orchestrator.compile_waiting_time&metrics=orchestrator.compile_rate&metrics=resource.agent_count&metrics=resource.resource_count&start_interval=2023-01-13T08%3A23%3A24.290Z&end_interval=2023-01-20T08%3A23%3A24.290Z&nb_datapoints=14`,
    identity
  );
}
