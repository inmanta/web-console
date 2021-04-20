import { Fetcher, StateHelper } from "@/Core";
import { identity } from "lodash";
import { OneTimeHookHelperImpl } from "../HookHelperImpl";

export class InstanceLogsHookHelper extends OneTimeHookHelperImpl<"InstanceLogs"> {
  constructor(
    fetcher: Fetcher<"InstanceLogs">,
    stateHelper: StateHelper<"InstanceLogs">
  ) {
    super(
      fetcher,
      stateHelper,
      (qualifier) => [qualifier.id, qualifier.service_entity],
      "InstanceLogs",
      ({ service_entity, id }) =>
        `/lsm/v1/service_inventory/${service_entity}/${id}/log`,
      identity
    );
  }
}
