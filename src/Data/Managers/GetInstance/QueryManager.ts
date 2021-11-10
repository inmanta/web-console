import { identity } from "lodash";
import { StateHelper, Scheduler, ApiHelper } from "@/Core";
import { PrimaryContinuousQueryManager } from "@/Data/Managers/Helpers";

export class ServiceInstanceQueryManager extends PrimaryContinuousQueryManager<"GetServiceInstance"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetServiceInstance">,
    scheduler: Scheduler,
    useEnvironment: () => string
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
      identity,
      useEnvironment
    );
  }
}
