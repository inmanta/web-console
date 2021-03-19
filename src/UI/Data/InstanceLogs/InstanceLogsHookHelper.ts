import { SubscriptionController, DataManager } from "@/Core";
import { identity } from "lodash";
import { HookHelperImpl } from "../HookHelperImpl";

export class InstanceLogsHookHelper extends HookHelperImpl<"InstanceLogs"> {
  constructor(
    dataManager: DataManager<"InstanceLogs">,
    subscriptionController: SubscriptionController
  ) {
    super(
      dataManager,
      subscriptionController,
      (qualifier) => qualifier.id,
      (qualifier) => [qualifier.id, qualifier.service_entity],
      "InstanceLogs",
      ({ service_entity, id }) =>
        `/lsm/v1/service_inventory/${service_entity}/${id}/log`,
      identity
    );
  }
}
