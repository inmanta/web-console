import { identity } from "lodash";
import { StateHelper, Scheduler, ApiHelper } from "@/Core";
import { PrimaryContinuousQueryManagerWithEnv } from "@/Data/Managers/Helpers";

export class DiagnosticsQueryManager extends PrimaryContinuousQueryManagerWithEnv<"GetDiagnostics"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetDiagnostics">,
    scheduler: Scheduler
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      ({ kind, id }) => `${kind}_${id}`,
      ({ id, service_entity }) => [id, service_entity],
      "GetDiagnostics",
      ({ service_entity, id }) =>
        `/lsm/v1/service_inventory/${service_entity}/${id}/diagnose`,
      identity
    );
  }
}
