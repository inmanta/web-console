import { Scheduler, StateHelper, ApiHelper } from "@/Core";
import {
  getPaginationHandlers,
  PrimaryContinuousQueryManager,
} from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export class ResourceHistoryQueryManager extends PrimaryContinuousQueryManager<"GetResourceHistory"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetResourceHistory">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      () => environment,
      ({ sort, pageSize }) => [
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
      },
      environment
    );
  }
}
