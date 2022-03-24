import { WithId } from "@/Core/Language";
import { AgentProcess } from "./Model";

export interface Query extends WithId {
  kind: "GetAgentProcess";
}

export interface Manifest {
  error: string;
  apiResponse: {
    data: AgentProcess;
  };
  data: AgentProcess;
  usedData: AgentProcess;
  query: Query;
}
