import { identity } from "lodash";
import { ApiHelper } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";
import { Store } from "@/Data/Store";
import { StateHelper } from "./StateHelper";
import { getUrl } from "./getUrl";

export class Manager extends QueryManager.OneTimeWithEnv<"GetDryRunReport"> {
  constructor(apiHelper: ApiHelper, store: Store) {
    super(
      apiHelper,
      new StateHelper(store),
      ({ reportId }, environment) => [environment, reportId],
      "GetDryRunReport",
      getUrl,
      identity
    );
  }
}
