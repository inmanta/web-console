import { SubscriptionController, DataManager } from "@/Core";
import { identity } from "lodash";
import { ContinuousHookHelperImpl } from "../HookHelperImpl";

export class ResourcesHookHelper extends ContinuousHookHelperImpl<"Resources"> {
  constructor(
    dataManager: DataManager<"Resources">,
    subscriptionController: SubscriptionController
  ) {
    super(
      dataManager,
      subscriptionController,
      (qualifier) => qualifier.id,
      (qualifier) => [qualifier.id, qualifier.version],
      "Resources",
      ({ service_entity, id, version }) =>
        `/lsm/v1/service_inventory/${service_entity}/${id}/resources?current_version=${version}`,
      identity
    );
  }
}
