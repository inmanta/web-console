import { SubscriptionController, DataManager, Query } from "@/Core";
import { ContinuousHookHelperImpl } from "../HookHelperImpl";
import { getServiceInstancesUrl } from "./getServiceInstancesUrl";

export class ServiceInstancesHookHelper extends ContinuousHookHelperImpl<"ServiceInstances"> {
  constructor(
    dataManager: DataManager<"ServiceInstances">,
    subscriptionController: SubscriptionController
  ) {
    super(
      dataManager,
      subscriptionController,
      (qualifier) => qualifier.name,
      (qualifier) => [
        qualifier.name,
        stringifyFilter(qualifier.filter),
        qualifier.sort?.name,
        qualifier.sort?.order,
      ],
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

function stringifyFilter(filter: Query.Filter | undefined): string {
  return typeof filter === "undefined" ? "undefined" : JSON.stringify(filter);
}
