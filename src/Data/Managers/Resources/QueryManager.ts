import { Scheduler, StateHelper, ResourceParams, ApiHelper } from "@/Core";
import {
  getPaginationHandlers,
  PrimaryContinuousQueryManager,
} from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export class ResourcesQueryManager extends PrimaryContinuousQueryManager<"GetResources"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetResources">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      () => environment,
      ({ filter, sort, pageSize }) => [
        environment,
        pageSize.value,
        sort?.name,
        sort?.order,
        stringifyFilter(filter),
      ],
      "GetResources",
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

function stringifyFilter(filter: ResourceParams.Filter | undefined): string {
  return typeof filter === "undefined" ? "undefined" : JSON.stringify(filter);
}
