import { identity } from "lodash-es";
import { ApiHelper, StateHelperWithEnv } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";
import { getUrl } from "@S/ServiceCatalog/Data/Callbacks/getUrl";

export class CallbacksQueryManager extends QueryManager.OneTimeWithEnv<"GetCallbacks"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelperWithEnv<"GetCallbacks">
  ) {
    super(apiHelper, stateHelper, () => [], "GetCallbacks", getUrl, identity);
  }
}
