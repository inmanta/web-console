import { AgentStatus } from "@/Core/Domain/Agent";

export interface Filter {
  name?: string[];
  process_name?: string[];
  status?: AgentStatus[];
}
