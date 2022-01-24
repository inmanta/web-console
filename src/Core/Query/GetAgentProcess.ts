import { AgentProcess } from "@/Core/Domain";
import { WithId } from "@/Core/Language";

export interface GetAgentProcess extends WithId {
  kind: "GetAgentProcess";
}

export interface GetAgentProcessManifest {
  error: string;
  apiResponse: {
    data: AgentProcess;
  };
  data: AgentProcess;
  usedData: AgentProcess;
  query: GetAgentProcess;
}
