import { identity } from "lodash-es";
import { ApiHelper, Scheduler, StateHelper } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";

export class GetInstanceLogsQueryManager extends QueryManager.ContinuousWithEnv<"GetInstanceLogs"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetInstanceLogs">,
    scheduler: Scheduler
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      ({ kind, id }) => `${kind}_${id}`,
      ({ id, service_entity }) => [id, service_entity],
      "GetInstanceLogs",
      ({ service_entity, id }) =>
        `/lsm/v1/service_inventory/${service_entity}/${id}/log`,
      identity
    );
  }
}
