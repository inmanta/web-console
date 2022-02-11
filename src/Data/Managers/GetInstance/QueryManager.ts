import { identity } from "lodash-es";
import { StateHelper, Scheduler, ApiHelper } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";

export class ServiceInstanceQueryManager extends QueryManager.ContinuousWithEnv<"GetServiceInstance"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetServiceInstance">,
    scheduler: Scheduler
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      ({ kind, id }) => `${kind}_${id}`,
      ({ id }) => [id],
      "GetServiceInstance",
      ({ service_entity, id }) =>
        `/lsm/v1/service_inventory/${service_entity}/${id}`,
      identity
    );
  }
}
