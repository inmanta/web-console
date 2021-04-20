import {
  SubscriptionController,
  KeyMaker,
  Query,
  Fetcher,
  StateHelper,
} from "@/Core";
import { ContinuousHookHelperImpl } from "../HookHelperImpl";
import { identity } from "lodash";

export class ServiceHookHelper extends ContinuousHookHelperImpl<"Service"> {
  constructor(
    fetcher: Fetcher<"Service">,
    stateHelper: StateHelper<"Service">,
    subscriptionController: SubscriptionController,
    keyMaker: KeyMaker<Query.Qualifier<"Service">>
  ) {
    super(
      fetcher,
      stateHelper,
      subscriptionController,
      (qualifier) => keyMaker.make(qualifier),
      (qualifier) => [qualifier.name, qualifier.environment],
      "Service",
      ({ name }) => `/lsm/v1/service_catalog/${name}`,
      identity
    );
  }
}
