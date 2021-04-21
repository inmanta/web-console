import { SubscriptionController, Fetcher, StateHelper } from "@/Core";
import { ContinuousDataManagerImpl } from "../DataManagerImpl";
import { identity } from "lodash";

export class ServicesHookHelper extends ContinuousDataManagerImpl<"Services"> {
  constructor(
    fetcher: Fetcher<"Services">,
    stateHelper: StateHelper<"Services">,
    subscriptionController: SubscriptionController
  ) {
    super(
      fetcher,
      stateHelper,
      subscriptionController,
      (qualifier) => qualifier.environment,
      (qualifier) => [qualifier.environment],
      "Services",
      () => `/lsm/v1/service_catalog`,
      identity
    );
  }
}
