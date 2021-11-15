import { identity } from "lodash";
import { ApiHelper, Scheduler, StateHelper } from "@/Core";
import { PrimaryContinuousQueryManagerWithEnv } from "@/Data/Managers/Helpers";

export class GetInstanceLogsQueryManager extends PrimaryContinuousQueryManagerWithEnv<"GetInstanceLogs"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetInstanceLogs">,
    scheduler: Scheduler
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      ({ id }) => id,
      ({ id, service_entity }) => [id, service_entity],
      "GetInstanceLogs",
      ({ service_entity, id }) =>
        `/lsm/v1/service_inventory/${service_entity}/${id}/log`,
      identity
    );
  }
}
