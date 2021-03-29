import { SubscriptionController, DataManager } from "@/Core";
import { ContinuousHookHelperImpl } from "../HookHelperImpl";
import { identity } from "lodash";

export class ServicesHookHelper extends ContinuousHookHelperImpl<"Services"> {
  constructor(
    dataManager: DataManager<"Services">,
    subscriptionController: SubscriptionController
  ) {
    super(
      dataManager,
      subscriptionController,
      (qualifier) => qualifier.environment,
      (qualifier) => [qualifier.environment],
      "Services",
      () => `/lsm/v1/service_catalog`,
      identity
    );
  }
}
