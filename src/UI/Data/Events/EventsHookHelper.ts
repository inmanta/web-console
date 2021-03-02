import { SubscriptionController, DataManager } from "@/Core";
import { HookHelperImpl } from "../HookHelperImpl";

export class EventsHookHelper extends HookHelperImpl<"Events"> {
  constructor(
    dataManager: DataManager<"Events">,
    subscriptionController: SubscriptionController
  ) {
    super(
      dataManager,
      subscriptionController,
      (qualifier) => qualifier.id,
      (qualifier) => [qualifier.id, qualifier.service_entity],
      "Events"
    );
  }
}
