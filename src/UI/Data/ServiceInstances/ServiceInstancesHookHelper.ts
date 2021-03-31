import { SubscriptionController, DataManager } from "@/Core";
import { HookHelperImpl } from "../HookHelperImpl";
import { getServiceInstancesUrl } from "./getServiceInstancesUrl";

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
      getServiceInstancesUrl,
      ({ data, links, metadata }, setUrl) => {
        if (typeof links === "undefined")
          return { data: data, handlers: {}, metadata };
        const { prev, next } = links;
        const prevCb = prev ? () => setUrl(prev) : undefined;
        const nextCb = next ? () => setUrl(next) : undefined;
        return {
          data: data,
          handlers: { prev: prevCb, next: nextCb },
          metadata,
        };
      }
    );
  }
}
