import { Scheduler, StateHelper, ApiHelper, AgentParams } from "@/Core";
import {
  getPaginationHandlers,
  PrimaryContinuousQueryManagerWithEnv,
} from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export class GetAgentsQueryManager extends PrimaryContinuousQueryManagerWithEnv<"GetAgents"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetAgents">,
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
        stringifyFilter(filter),
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

function stringifyFilter(filter: AgentParams.Filter | undefined): string {
  return typeof filter === "undefined" ? "undefined" : JSON.stringify(filter);
}
