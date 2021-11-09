import { identity } from "lodash";
import { ApiHelper, StateHelper } from "@/Core";
import { getUrl } from "@/Data/Managers/Callbacks/getUrl";
import { PrimaryOneTimeQueryManager } from "@/Data/Managers/Helpers";

export class CallbacksQueryManager extends PrimaryOneTimeQueryManager<"GetCallbacks"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetCallbacks">,
    environment: string
  ) {
    super(
      apiHelper,
      stateHelper,
      () => [environment],
      "GetCallbacks",
      getUrl,
      identity,
      environment
    );
  }
}
