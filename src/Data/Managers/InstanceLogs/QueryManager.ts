import { Fetcher, StateHelper } from "@/Core";
import { identity } from "lodash";
import { OneTimeQueryManagerImpl } from "@/Data/Common";

export class InstanceLogsQueryManager extends OneTimeQueryManagerImpl<"GetInstanceLogs"> {
  constructor(
    fetcher: Fetcher<"GetInstanceLogs">,
    stateHelper: StateHelper<"GetInstanceLogs">,
    environment: string
  ) {
    super(
      fetcher,
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
