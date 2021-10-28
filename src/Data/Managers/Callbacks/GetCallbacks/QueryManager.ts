import { ApiHelper, StateHelper } from "@/Core";
import { PrimaryOneTimeQueryManager } from "@/Data/Common";
import { identity } from "lodash";
import { getUrl } from "@/Data/Managers/Callbacks/getUrl";

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
