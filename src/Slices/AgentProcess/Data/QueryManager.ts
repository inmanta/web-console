import { identity } from "lodash-es";
import { ApiHelper } from "@/Core";
import { Store } from "@/Data";
import { QueryManager } from "@/Data/Managers/Helpers";
import { StateHelper } from "./StateHelper";

export class GetAgentProcessQueryManager extends QueryManager.OneTimeWithEnv<"GetAgentProcess"> {
  constructor(store: Store, apiHelper: ApiHelper) {
    super(
      apiHelper,
      new StateHelper(store),
      ({ id }) => [id],
      "GetAgentProcess",
      ({ id }) => `/api/v2/agents/process/${id}?report=True`,
      identity
    );
  }
}
