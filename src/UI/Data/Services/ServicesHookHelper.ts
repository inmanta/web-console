import { SubscriptionController, DataManager } from "@/Core";
import { HookHelperImpl } from "../HookHelperImpl";

export class ServicesHookHelper extends HookHelperImpl<"Services"> {
  constructor(
    dataManager: DataManager<"Services">,
    subscriptionController: SubscriptionController
  ) {
    super(
      dataManager,
      subscriptionController,
      (qualifier) => qualifier.id,
      (qualifier) => [qualifier.id],
      "Services"
    );
  }
}
