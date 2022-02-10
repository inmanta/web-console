import { identity } from "lodash";
import { ApiHelper } from "@/Core";
import { Store } from "@/Data";
import { PrimaryOneTimeQueryManagerWithEnv } from "@/Data/Managers/Helpers";
import { StateHelper } from "./StateHelper";
import { getUrl } from "./getUrl";

export class QueryManager extends PrimaryOneTimeQueryManagerWithEnv<"GetDryRunReport"> {
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
