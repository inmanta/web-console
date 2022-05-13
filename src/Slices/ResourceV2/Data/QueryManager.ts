import { Scheduler, ApiHelper } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";
import { Store } from "@/Data/Store";
import { StateHelper } from "./StateHelper";
import { getUrl } from "./getUrlResources";

export class GetResourcesV2QueryManager extends QueryManager.ContinuousWithEnv<"GetResourcesV2"> {
  constructor(store: Store, apiHelper: ApiHelper, scheduler: Scheduler) {
    super(
      apiHelper,
      new StateHelper(store),
      scheduler,
      ({ kind }, environment) => `${kind}_${environment}`,
      ({}, environment) => [environment],
      "GetResourcesV2",
      getUrl,
      ({ data, links, metadata }) => {
        if (typeof links === "undefined") {
          return { data: data, handlers: {}, metadata };
        }
        return {
          data: data,
          handlers: {},
          metadata,
        };
      }
    );
  }
}
