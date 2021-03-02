import { SubscriptionController, DataManager } from "@/Core";
import { HookHelperImpl } from "../HookHelperImpl";

export class ResourcesHookHelper extends HookHelperImpl<"Resources"> {
  constructor(
    dataManager: DataManager<"Resources">,
    subscriptionController: SubscriptionController
  ) {
    super(
      dataManager,
      subscriptionController,
      (qualifier) => qualifier.id,
      (qualifier) => [qualifier.id, qualifier.version],
      "Resources"
    );
  }
}
