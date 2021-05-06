import { Scheduler, Fetcher, StateHelper, ServiceInstanceParams } from "@/Core";
import { ContinuousDataManagerImpl } from "../DataManagerImpl";
import { getUrl } from "./getUrl";

export class ServiceInstancesDataManager extends ContinuousDataManagerImpl<"ServiceInstances"> {
  constructor(
    fetcher: Fetcher<"ServiceInstances">,
    stateHelper: StateHelper<"ServiceInstances">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      fetcher,
      stateHelper,
      scheduler,
      (qualifier) => qualifier.name,
      (qualifier) => [
        qualifier.name,
        stringifyFilter(qualifier.filter),
        qualifier.sort?.name,
        qualifier.sort?.order,
      ],
      "ServiceInstances",
      getUrl,
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
      },
      environment
    );
  }
}

function stringifyFilter(
  filter: ServiceInstanceParams.Filter | undefined
): string {
  return typeof filter === "undefined" ? "undefined" : JSON.stringify(filter);
}
