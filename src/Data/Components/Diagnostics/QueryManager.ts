import { Fetcher, StateHelper, Scheduler } from "@/Core";
import { identity } from "lodash";
import { ContinuousQueryManagerImpl } from "@/Data/Common";

export class DiagnosticsQueryManager extends ContinuousQueryManagerImpl<"Diagnostics"> {
  constructor(
    fetcher: Fetcher<"Diagnostics">,
    stateHelper: StateHelper<"Diagnostics">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      fetcher,
      stateHelper,
      scheduler,
      ({ id }) => id,
      ({ id, service_entity }) => [id, service_entity],
      "Diagnostics",
      ({ service_entity, id }) =>
        `/lsm/v1/service_inventory/${service_entity}/${id}/diagnose`,
      identity,
      environment
    );
  }
}
