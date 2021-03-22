import { SubscriptionController, DataManager } from "@/Core";
import { identity } from "lodash";
import { HookHelperImpl } from "../HookHelperImpl";

export class InstanceConfigHookHelper extends HookHelperImpl<"InstanceConfig"> {
  constructor(
    dataManager: DataManager<"InstanceConfig">,
    subscriptionController: SubscriptionController
  ) {
    super(
      dataManager,
      subscriptionController,
      (qualifier) => qualifier.id,
      (qualifier) => [qualifier.id, qualifier.service_entity],
      "InstanceConfig",
      ({ service_entity, id }) =>
        `/lsm/v1/service_inventory/${service_entity}/${id}/config`,
      identity
    );
  }
}
