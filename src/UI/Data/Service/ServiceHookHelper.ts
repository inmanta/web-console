import { SubscriptionController, DataManager, KeyMaker, Query } from "@/Core";
import { HookHelperImpl } from "../HookHelperImpl";
import { identity } from "lodash";

export class ServiceHookHelper extends HookHelperImpl<"Service"> {
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
