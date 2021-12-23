import { identity } from "lodash";
import { ApiHelper, StateHelperWithEnv } from "@/Core";
import { getUrl } from "@/Data/Managers/Callbacks/getUrl";
import { PrimaryOneTimeQueryManagerWithEnvWithStateHelperWithEnv } from "@/Data/Managers/Helpers";

export class CallbacksQueryManager extends PrimaryOneTimeQueryManagerWithEnvWithStateHelperWithEnv<"GetCallbacks"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelperWithEnv<"GetCallbacks">
  ) {
    super(apiHelper, stateHelper, () => [], "GetCallbacks", getUrl, identity);
  }
}
