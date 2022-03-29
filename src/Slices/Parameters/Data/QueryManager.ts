import {
  Scheduler,
  ApiHelper,
  StateHelperWithEnv,
  stringifyObjectOrUndefined,
} from "@/Core";
import { getPaginationHandlers, QueryManager } from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export class GetParametersQueryManager extends QueryManager.ContinuousWithEnv<"GetParameters"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelperWithEnv<"GetParameters">,
    scheduler: Scheduler
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      ({ kind }, environment) => `${kind}_${environment}`,
      ({ pageSize, filter, sort }, environment) => [
        environment,
        pageSize.value,
        sort?.name,
        sort?.order,
        stringifyObjectOrUndefined(filter),
      ],
      "GetParameters",
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
