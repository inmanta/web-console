import { identity } from "lodash";
import { ApiHelper, Scheduler, StateHelper } from "@/Core";
import { PrimaryContinuousQueryManager } from "@/Data/Managers/Helpers";

export class GetInstanceLogsQueryManager extends PrimaryContinuousQueryManager<"GetInstanceLogs"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetInstanceLogs">,
    scheduler: Scheduler,
    environment: string
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
      identity,
      environment
    );
  }
}
