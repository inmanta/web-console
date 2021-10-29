import { StateHelper, Scheduler, ApiHelper } from "@/Core";
import { identity } from "lodash";
import { PrimaryContinuousQueryManager } from "@/Data/Managers/Helpers";

export class DiagnosticsQueryManager extends PrimaryContinuousQueryManager<"GetDiagnostics"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetDiagnostics">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      ({ id }) => id,
      ({ id, service_entity }) => [id, service_entity],
      "GetDiagnostics",
      ({ service_entity, id }) =>
        `/lsm/v1/service_inventory/${service_entity}/${id}/diagnose`,
      identity,
      environment
    );
  }
}
