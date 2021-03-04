import { SubscriptionController, DataManager } from "@/Core";
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
      "InstanceLogs"
    );
  }
}
