import {
  Scheduler,
  ApiHelper,
  stringifyObjectOrUndefined,
  StateHelperWithEnv,
} from "@/Core";
import { getPaginationHandlers, QueryManager } from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export class GetVersionResourcesQueryManager extends QueryManager.ContinuousWithEnv<"GetVersionResources"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelperWithEnv<"GetVersionResources">,
    scheduler: Scheduler
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      ({ kind, version }) => `${kind}_${version}`,
      ({ pageSize, filter, sort }, environment) => [
        environment,
        pageSize.value,
        stringifyObjectOrUndefined(filter),
        sort?.name,
        sort?.order,
      ],
      "GetVersionResources",
      getUrl,
      ({ data, links, metadata }, setUrl) => {
        if (typeof links === "undefined")
          return { data, handlers: {}, metadata };
        return {
          data,
          handlers: getPaginationHandlers(links, metadata, setUrl),
          metadata,
        };
      }
    );
  }
}
