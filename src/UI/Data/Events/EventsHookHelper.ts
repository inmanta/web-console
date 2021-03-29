import { SubscriptionController, DataManager } from "@/Core";
import { identity } from "lodash";
import { ContinuousHookHelperImpl } from "../HookHelperImpl";

export class EventsHookHelper extends ContinuousHookHelperImpl<"Events"> {
  constructor(
    dataManager: DataManager<"Events">,
    subscriptionController: SubscriptionController
  ) {
    super(
      dataManager,
      subscriptionController,
      (qualifier) => qualifier.id,
      (qualifier) => [qualifier.id, qualifier.service_entity],
      "Events",
      ({ service_entity, id }) =>
        `/lsm/v1/service_inventory/${service_entity}/${id}/events`,
      identity
    );
  }
}
