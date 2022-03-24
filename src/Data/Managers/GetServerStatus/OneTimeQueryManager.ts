import { identity } from "lodash-es";
import { StateHelper, ApiHelper } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";

export class GetServerStatusOneTimeQueryManager extends QueryManager.OneTime<"GetServerStatus"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetServerStatus">
  ) {
    super(
      apiHelper,
      stateHelper,
      () => [],
      "GetServerStatus",
      () => `/api/v1/serverstatus`,
      identity,
      "MERGE"
    );
  }
}
