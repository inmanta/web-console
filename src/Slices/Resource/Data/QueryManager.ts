import { Scheduler, Resource, ApiHelper } from "@/Core";
import { Store } from "@/Data";
import { getPaginationHandlers, QueryManager } from "@/Data/Managers/Helpers";
import { StateHelper } from "./StateHelper";
import { getUrl } from "./getUrl";

export class GetResourcesQueryManager extends QueryManager.ContinuousWithEnv<"GetResources"> {
  constructor(store: Store, apiHelper: ApiHelper, scheduler: Scheduler) {
    super(
      apiHelper,
      new StateHelper(store),
      scheduler,
      ({ kind }, environment) => `${kind}_${environment}`,
      ({ filter, sort, pageSize }, environment) => [
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
      }
    );
  }
}

function stringifyFilter(filter: Resource.Filter | undefined): string {
  return typeof filter === "undefined" ? "undefined" : JSON.stringify(filter);
}
