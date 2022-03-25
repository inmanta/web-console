import { Scheduler, ApiHelper, stringifyObjectOrUndefined } from "@/Core";
import { Store } from "@/Data";
import { getPaginationHandlers, QueryManager } from "@/Data/Managers/Helpers";
import { StateHelper } from "./StateHelper";
import { getUrl } from "./getUrl";

export class GetAgentsQueryManager extends QueryManager.ContinuousWithEnv<"GetAgents"> {
  constructor(store: Store, apiHelper: ApiHelper, scheduler: Scheduler) {
    super(
      apiHelper,
      new StateHelper(store),
      scheduler,
      ({ kind }, environment) => `${kind}_${environment}`,
      ({ pageSize, sort, filter }, environment) => [
        environment,
        pageSize.value,
        sort?.name,
        sort?.order,
        stringifyObjectOrUndefined(filter),
      ],
      "GetAgents",
      (query) => getUrl(query),
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
