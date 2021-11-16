import { Scheduler, StateHelper, ApiHelper } from "@/Core";
import {
  getPaginationHandlers,
  PrimaryContinuousQueryManagerWithEnv,
} from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export class ResourceHistoryQueryManager extends PrimaryContinuousQueryManagerWithEnv<"GetResourceHistory"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetResourceHistory">,
    scheduler: Scheduler
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      (query, environment) => environment,
      ({ sort, pageSize }, environment) => [
        environment,
        pageSize.value,
        sort?.name,
        sort?.order,
      ],
      "GetResourceHistory",
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
