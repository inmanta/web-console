import { AgentStatus } from "@inmanta/web-console-core/Domain/Agent";

export interface Filter {
  name?: string[];
  process_name?: string[];
  status?: AgentStatus[];
}
