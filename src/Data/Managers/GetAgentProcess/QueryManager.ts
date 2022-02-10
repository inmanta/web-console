import { identity } from "lodash-es";
import { StateHelper, ApiHelper } from "@/Core";
import { PrimaryOneTimeQueryManagerWithEnvWithStateHelperWithEnv } from "@/Data/Managers/Helpers";

export class GetAgentProcessQueryManager extends PrimaryOneTimeQueryManagerWithEnvWithStateHelperWithEnv<"GetAgentProcess"> {
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
