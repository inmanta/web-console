import { identity } from "lodash-es";
import { ApiHelper, StateHelperWithEnv } from "@/Core";
import { getUrl } from "@/Data/Managers/Callbacks/getUrl";
import { PrimaryOneTimeQueryManagerWithEnv } from "@/Data/Managers/Helpers";

export class CallbacksQueryManager extends PrimaryOneTimeQueryManagerWithEnv<"GetCallbacks"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelperWithEnv<"GetCallbacks">
  ) {
    super(apiHelper, stateHelper, () => [], "GetCallbacks", getUrl, identity);
  }
}
