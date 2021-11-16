import { identity } from "lodash";
import { StateHelper, ApiHelper } from "@/Core";
import { PrimaryOneTimeQueryManager } from "@/Data/Managers/Helpers";

export class GetServerStatusQueryManager extends PrimaryOneTimeQueryManager<"GetServerStatus"> {
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
      identity
    );
  }
}
