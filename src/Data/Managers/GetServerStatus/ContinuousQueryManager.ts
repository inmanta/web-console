import { identity } from "lodash-es";
import { StateHelper, ApiHelper, Scheduler } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";

export class GetServerStatusContinuousQueryManager extends QueryManager.Continuous<"GetServerStatus"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetServerStatus">,
    scheduler: Scheduler
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      ({ kind }) => kind,
      () => [],
      "GetServerStatus",
      () => `/api/v1/serverstatus`,
      identity
    );
  }
}
