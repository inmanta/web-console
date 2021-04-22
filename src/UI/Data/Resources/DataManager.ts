import { Fetcher, StateHelper, Scheduler } from "@/Core";
import { identity } from "lodash";
import { ContinuousDataManagerImpl } from "../DataManagerImpl";

export class ResourcesDataManager extends ContinuousDataManagerImpl<"Resources"> {
  constructor(
    fetcher: Fetcher<"Resources">,
    stateHelper: StateHelper<"Resources">,
    scheduler: Scheduler
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
      identity
    );
  }
}
