import { identity } from "lodash-es";
import { StateHelper, ApiHelper } from "@/Core";
import { PrimaryOneTimeQueryManagerWithEnv } from "@/Data/Managers/Helpers";

export class GetAgentProcessQueryManager extends PrimaryOneTimeQueryManagerWithEnv<"GetAgentProcess"> {
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
