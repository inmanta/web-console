import { Fetcher, StateHelper, Scheduler } from "@/Core";
import { identity } from "lodash";
import { ContinuousDataManagerImpl } from "../DataManagerImpl";

export class EventsDataManager extends ContinuousDataManagerImpl<"Events"> {
  constructor(
    fetcher: Fetcher<"Events">,
    stateHelper: StateHelper<"Events">,
    scheduler: Scheduler
  ) {
    super(
      fetcher,
      stateHelper,
      scheduler,
      (qualifier) => qualifier.id,
      (qualifier) => [qualifier.id, qualifier.service_entity],
      "Events",
      ({ service_entity, id }) =>
        `/lsm/v1/service_inventory/${service_entity}/${id}/events`,
      identity
    );
  }
}
