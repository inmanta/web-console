import { Scheduler, StateHelper, ApiHelper } from "@/Core";
import {
  getPaginationHandlers,
  PrimaryContinuousQueryManagerWithEnvWithStateHelperWithEnv,
} from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export class ResourceHistoryQueryManager extends PrimaryContinuousQueryManagerWithEnvWithStateHelperWithEnv<"GetResourceHistory"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetResourceHistory">,
    scheduler: Scheduler
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      ({ kind, id }) => `${kind}_${id}`,
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
