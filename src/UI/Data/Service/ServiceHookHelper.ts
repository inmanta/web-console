import { SubscriptionController, DataManager, KeyMaker, Query } from "@/Core";
import { ContinuousHookHelperImpl } from "../HookHelperImpl";
import { identity } from "lodash";

export class ServiceHookHelper extends ContinuousHookHelperImpl<"Service"> {
  constructor(
    dataManager: DataManager<"Service">,
    subscriptionController: SubscriptionController,
    keyMaker: KeyMaker<Query.Qualifier<"Service">>
  ) {
    super(
      dataManager,
      subscriptionController,
      (qualifier) => keyMaker.make(qualifier),
      (qualifier) => [qualifier.name, qualifier.environment],
      "Service",
      ({ name }) => `/lsm/v1/service_catalog/${name}`,
      identity
    );
  }
}
