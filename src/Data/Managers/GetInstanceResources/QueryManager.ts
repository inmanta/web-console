import { identity } from "lodash-es";
import { StateHelper, Scheduler, ApiHelper } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";

export class InstanceResourcesQueryManager extends QueryManager.ContinuousWithEnv<"GetInstanceResources"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetInstanceResources">,
    scheduler: Scheduler
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      ({ kind, id }) => `${kind}_${id}`,
      ({ id, version }) => [id, version.toString()],
      "GetInstanceResources",
      ({ service_entity, id, version }) =>
        `/lsm/v1/service_inventory/${service_entity}/${id}/resources?current_version=${version}`,
      identity
    );
  }
}
