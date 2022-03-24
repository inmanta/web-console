import { identity } from "lodash-es";
import { StateHelper, ApiHelper } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";

export class GetAgentProcessQueryManager extends QueryManager.OneTimeWithEnv<"GetAgentProcess"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetAgentProcess">
  ) {
    super(
      apiHelper,
      stateHelper,
      ({ id }) => [id],
      "GetAgentProcess",
      ({ id }) => `/api/v2/agents/process/${id}?report=True`,
      identity
    );
  }
}
