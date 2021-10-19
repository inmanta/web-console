import {
  Scheduler,
  StateHelper,
  ServiceInstanceParams,
  ApiHelper,
} from "@/Core";
import {
  getPaginationHandlers,
  PrimaryContinuousQueryManager,
} from "@/Data/Common";
import { getUrl } from "./getUrl";

export class ServiceInstancesQueryManager extends PrimaryContinuousQueryManager<"ServiceInstances"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"ServiceInstances">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      apiHelper,
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
