import { AgentStatus } from "./AgentStatus";

export interface Agent {
  environment: string;
  name: string;
  last_failover?: string;
  paused: boolean;
  process_id?: string;
  process_name?: string;
  unpause_on_resume?: boolean;
  status: AgentStatus;
}

export interface AgentRow {
  name: string;
  last_failover?: string;
  process_id?: string;
  process_name?: string;
  unpause_on_resume?: boolean;
  paused: boolean;
  status: AgentStatus;
}
