import { Fetcher, StateHelper } from "@/Core";
import { OneTimeQueryManagerImpl } from "@/Data/Common";
import { identity } from "lodash";
import { getUrl } from "@/Data/Managers/Callbacks/getUrl";

export class CallbacksQueryManager extends OneTimeQueryManagerImpl<"GetCallbacks"> {
  constructor(
    fetcher: Fetcher<"GetCallbacks">,
    stateHelper: StateHelper<"GetCallbacks">,
    environment: string
  ) {
    super(
      fetcher,
      stateHelper,
      () => [environment],
      "GetCallbacks",
      getUrl,
      identity,
      environment
    );
  }
}
