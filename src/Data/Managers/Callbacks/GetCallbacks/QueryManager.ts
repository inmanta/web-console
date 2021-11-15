import { identity } from "lodash";
import { ApiHelper, StateHelper } from "@/Core";
import { getUrl } from "@/Data/Managers/Callbacks/getUrl";
import { PrimaryOneTimeQueryManagerWithEnv } from "@/Data/Managers/Helpers";

export class CallbacksQueryManager extends PrimaryOneTimeQueryManagerWithEnv<"GetCallbacks"> {
  constructor(apiHelper: ApiHelper, stateHelper: StateHelper<"GetCallbacks">) {
    super(apiHelper, stateHelper, () => [], "GetCallbacks", getUrl, identity);
  }
}
