import { Fetcher, StateHelper } from "@/Core";
import { identity } from "lodash";
import { OneTimeQueryManagerImpl } from "@/UI/Data/QueryManagerImpl";

export class InstanceLogsQueryManager extends OneTimeQueryManagerImpl<"InstanceLogs"> {
  constructor(
    fetcher: Fetcher<"InstanceLogs">,
    stateHelper: StateHelper<"InstanceLogs">,
    environment: string
  ) {
    super(
      fetcher,
      stateHelper,
      ({ id, service_entity }) => [id, service_entity],
      "InstanceLogs",
      ({ service_entity, id }) =>
        `/lsm/v1/service_inventory/${service_entity}/${id}/log`,
      identity,
      environment
    );
  }
}
