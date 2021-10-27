import { StateHelper, Scheduler, ApiHelper } from "@/Core";
import { PrimaryContinuousQueryManager } from "@/Data/Common";
import { identity } from "lodash";

export class ServiceInstanceQueryManager extends PrimaryContinuousQueryManager<"GetServiceInstance"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetServiceInstance">,
    scheduler: Scheduler,
    environment: string
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
      environment
    );
  }
}
