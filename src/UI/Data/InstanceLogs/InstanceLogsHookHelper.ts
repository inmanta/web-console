import { DataManager } from "@/Core";
import { identity } from "lodash";
import { OneTimeHookHelperImpl } from "../HookHelperImpl";

export class InstanceLogsHookHelper extends OneTimeHookHelperImpl<"InstanceLogs"> {
  constructor(dataManager: DataManager<"InstanceLogs">) {
    super(
      dataManager,
      (qualifier) => [qualifier.id, qualifier.service_entity],
      "InstanceLogs",
      ({ service_entity, id }) =>
        `/lsm/v1/service_inventory/${service_entity}/${id}/log`,
      identity
    );
  }
}
