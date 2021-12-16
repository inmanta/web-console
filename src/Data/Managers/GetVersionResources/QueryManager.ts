import { Scheduler, StateHelper, ApiHelper, stringifyObject } from "@/Core";
import {
  getPaginationHandlers,
  PrimaryContinuousQueryManagerWithEnv,
} from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export class GetVersionResourcesQueryManager extends PrimaryContinuousQueryManagerWithEnv<"GetVersionResources"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetVersionResources">,
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
        stringifyObject(filter),
        sort?.name,
        sort?.order,
      ],
      "GetVersionResources",
      getUrl,
      ({ data, links, metadata }, setUrl) => {
        if (typeof links === "undefined")
          return { data: data, handlers: {}, metadata };
        return {
          data: data,
          handlers: getPaginationHandlers(links, metadata, setUrl),
          metadata,
        };
      }
    );
  }
}
