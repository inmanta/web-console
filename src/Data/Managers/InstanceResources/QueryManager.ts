import { Fetcher, StateHelper, Scheduler } from "@/Core";
import { identity } from "lodash";
import { ContinuousQueryManagerImpl } from "@/Data/Common";

export class InstanceResourcesQueryManager extends ContinuousQueryManagerImpl<"GetInstanceResources"> {
  constructor(
    fetcher: Fetcher<"GetInstanceResources">,
    stateHelper: StateHelper<"GetInstanceResources">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      fetcher,
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
