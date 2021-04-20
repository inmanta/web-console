import {
  SubscriptionController,
  Fetcher,
  StateHelper,
  ServiceInstanceParams,
} from "@/Core";
import { ContinuousHookHelperImpl } from "../HookHelperImpl";
import { getServiceInstancesUrl } from "./getServiceInstancesUrl";

export class ServiceInstancesHookHelper extends ContinuousHookHelperImpl<"ServiceInstances"> {
  constructor(
    fetcher: Fetcher<"ServiceInstances">,
    stateHelper: StateHelper<"ServiceInstances">,
    subscriptionController: SubscriptionController
  ) {
    super(
      fetcher,
      stateHelper,
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

function stringifyFilter(
  filter: ServiceInstanceParams.Filter | undefined
): string {
  return typeof filter === "undefined" ? "undefined" : JSON.stringify(filter);
}
