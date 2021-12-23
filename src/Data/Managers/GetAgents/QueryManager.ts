import {
  Scheduler,
  ApiHelper,
  stringifyObject,
  StateHelperWithEnv,
} from "@/Core";
import {
  getPaginationHandlers,
  PrimaryContinuousQueryManagerWithEnvWithStateHelperWithEnv,
} from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export class GetAgentsQueryManager extends PrimaryContinuousQueryManagerWithEnvWithStateHelperWithEnv<"GetAgents"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelperWithEnv<"GetAgents">,
    scheduler: Scheduler
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      ({ kind }, environment) => `${kind}_${environment}`,
      ({ pageSize, sort, filter }, environment) => [
        environment,
        pageSize.value,
        sort?.name,
        sort?.order,
        stringifyObject(filter),
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
