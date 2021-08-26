import { Scheduler, Fetcher, StateHelper, ServiceInstanceParams } from "@/Core";
import {
  ContinuousQueryManagerImpl,
  getPaginationHandlers,
} from "@/Data/Common";
import { getUrl } from "./getUrl";

export class ServiceInstancesQueryManager extends ContinuousQueryManagerImpl<"ServiceInstances"> {
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
      ({ name }) => name,
      ({ name, filter, sort, pageSize }) => [
        name,
        stringifyFilter(filter),
        sort?.name,
        sort?.order,
        pageSize.value,
      ],
      "ServiceInstances",
      getUrl,
      ({ data, links, metadata }, setUrl) => {
        if (typeof links === "undefined") {
          return { data: data, handlers: {}, metadata };
        }
        return {
          data: data,
          handlers: getPaginationHandlers(links, metadata, setUrl),
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
