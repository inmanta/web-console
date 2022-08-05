import { identity } from "lodash-es";
import { ApiHelper } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";
import { Store } from "@/Data/Store";
import { StateHelper } from "./StateHelper";
import { getUrl } from "./getUrl";

export class EnvironmentDetailsOneTimeQueryManager extends QueryManager.OneTime<"GetEnvironmentDetails"> {
  constructor(store: Store, apiHelper: ApiHelper) {
    super(
      apiHelper,
      new StateHelper(store),
      ({ id }) => [id],
      "GetEnvironmentDetails",
      ({ details, id }) => getUrl(details, id),
      identity,
      "MERGE"
    );
  }
}
