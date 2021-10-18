import { Fetcher, StateHelper, Scheduler } from "@/Core";
import { identity } from "lodash";
import { ContinuousQueryManagerImpl } from "@/Data/Common";

export class InstanceResourcesQueryManager extends ContinuousQueryManagerImpl<"InstanceResources"> {
  constructor(
    fetcher: Fetcher<"InstanceResources">,
    stateHelper: StateHelper<"InstanceResources">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      fetcher,
      stateHelper,
      scheduler,
      ({ id }) => id,
      ({ id, version }) => [id, version],
      "InstanceResources",
      ({ service_entity, id, version }) =>
        `/lsm/v1/service_inventory/${service_entity}/${id}/resources?current_version=${version}`,
      identity,
      environment
    );
  }
}
