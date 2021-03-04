import { SubscriptionController, DataManager } from "@/Core";
import { HookHelperImpl } from "../HookHelperImpl";

export class ServiceInstancesHookHelper extends HookHelperImpl<"ServiceInstances"> {
  constructor(
    dataManager: DataManager<"ServiceInstances">,
    subscriptionController: SubscriptionController
  ) {
    super(
      dataManager,
      subscriptionController,
      (qualifier) => qualifier.name,
      (qualifier) => [qualifier.name],
      "ServiceInstances"
    );
  }
}
