import { Fetcher, StateHelper, Scheduler } from "@/Core";
import { identity } from "lodash";
import { ContinuousQueryManagerImpl } from "@/UI/Data/QueryManagerImpl";

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
      (qualifier) => qualifier.id,
      (qualifier) => [qualifier.id, qualifier.service_entity],
      "Diagnostics",
      ({ qualifier: { service_entity, id } }) =>
        `/lsm/v1/service_inventory/${service_entity}/${id}/diagnose`,
      identity,
      environment
    );
  }
}
