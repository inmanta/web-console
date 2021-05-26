import { Fetcher, StateHelper, Scheduler } from "@/Core";
import { identity } from "lodash";
import { ContinuousQueryManagerImpl } from "@/UI/Data/QueryManagerImpl";

export class ResourcesQueryManager extends ContinuousQueryManagerImpl<"Resources"> {
  constructor(
    fetcher: Fetcher<"Resources">,
    stateHelper: StateHelper<"Resources">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      fetcher,
      stateHelper,
      scheduler,
      (qualifier) => qualifier.id,
      (qualifier) => [qualifier.id, qualifier.version],
      "Resources",
      ({ service_entity, id, version }) =>
        `/lsm/v1/service_inventory/${service_entity}/${id}/resources?current_version=${version}`,
      identity,
      environment
    );
  }
}
