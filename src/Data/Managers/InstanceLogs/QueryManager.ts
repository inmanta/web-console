import { ApiHelper, StateHelper } from "@/Core";
import { identity } from "lodash";
import { PrimaryOneTimeQueryManager } from "@/Data/Common";

export class InstanceLogsQueryManager extends PrimaryOneTimeQueryManager<"GetInstanceLogs"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetInstanceLogs">,
    environment: string
  ) {
    super(
      apiHelper,
      stateHelper,
      ({ id, service_entity }) => [id, service_entity],
      "GetInstanceLogs",
      ({ service_entity, id }) =>
        `/lsm/v1/service_inventory/${service_entity}/${id}/log`,
      identity,
      environment
    );
  }
}
