import { identity } from "lodash";
import { StateHelper, Scheduler, ApiHelper } from "@/Core";
import { PrimaryContinuousQueryManager } from "@/Data/Managers/Helpers";

export class InstanceResourcesQueryManager extends PrimaryContinuousQueryManager<"GetInstanceResources"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetInstanceResources">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      ({ id }) => id,
      ({ id, version }) => [id, version],
      "GetInstanceResources",
      ({ service_entity, id, version }) =>
        `/lsm/v1/service_inventory/${service_entity}/${id}/resources?current_version=${version}`,
      identity,
      environment
    );
  }
}
