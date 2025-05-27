import { AgentStatus } from "./Domain";

export interface Filter {
  name?: string[];
  process_name?: string[];
  status?: AgentStatus[];
}
