import {
  Scheduler,
  StateHelper,
  ServiceInstanceParams,
  ApiHelper,
} from "@/Core";
import {
  getPaginationHandlers,
  PrimaryContinuousQueryManagerWithEnv,
} from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export class ServiceInstancesQueryManager extends PrimaryContinuousQueryManagerWithEnv<"GetServiceInstances"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetServiceInstances">,
    scheduler: Scheduler
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      ({ kind, name }) => `${kind}_${name}`,
      ({ name, filter, sort, pageSize }) => [
        name,
        stringifyFilter(filter),
        sort?.name,
        sort?.order,
        pageSize.value,
      ],
      "GetServiceInstances",
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
      }
    );
  }
}

function stringifyFilter(
  filter: ServiceInstanceParams.Filter | undefined
): string {
  return typeof filter === "undefined" ? "undefined" : JSON.stringify(filter);
}
