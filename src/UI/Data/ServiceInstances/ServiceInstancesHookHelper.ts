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
      "ServiceInstances",
      ({ name }) =>
        `/lsm/v1/service_inventory/${name}?include_deployment_progress=True&limit=20`,
      ({ data, links }, setUrl) => {
        if (typeof links === "undefined") return { data: data, handlers: {} };
        const { prev, next } = links;
        const prevCb = prev ? () => setUrl(prev) : undefined;
        const nextCb = next ? () => setUrl(next) : undefined;
        return { data: data, handlers: { prev: prevCb, next: nextCb } };
      }
    );
  }
}
