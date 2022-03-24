import { AgentProcess } from "./Model";

export interface Query {
  kind: "GetAgentProcess";
  id: string;
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
