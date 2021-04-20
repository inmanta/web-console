import { SubscriptionController, Fetcher, StateHelper } from "@/Core";
import { identity } from "lodash";
import { ContinuousHookHelperImpl } from "../HookHelperImpl";

export class ResourcesHookHelper extends ContinuousHookHelperImpl<"Resources"> {
  constructor(
    fetcher: Fetcher<"Resources">,
    stateHelper: StateHelper<"Resources">,
    subscriptionController: SubscriptionController
  ) {
    super(
      fetcher,
      stateHelper,
      subscriptionController,
      (qualifier) => qualifier.id,
      (qualifier) => [qualifier.id, qualifier.version],
      "Resources",
      ({ service_entity, id, version }) =>
        `/lsm/v1/service_inventory/${service_entity}/${id}/resources?current_version=${version}`,
      identity
    );
  }
}
