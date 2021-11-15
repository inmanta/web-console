import { identity } from "lodash";
import { StateHelper, Scheduler, ApiHelper } from "@/Core";
import { PrimaryContinuousQueryManagerWithEnv } from "@/Data/Managers/Helpers";

export class ServiceInstanceQueryManager extends PrimaryContinuousQueryManagerWithEnv<"GetServiceInstance"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetServiceInstance">,
    scheduler: Scheduler
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      ({ id }) => id,
      ({ id }) => [id],
      "GetServiceInstance",
      ({ service_entity, id }) =>
        `/lsm/v1/service_inventory/${service_entity}/${id}`,
      identity
    );
  }
}
