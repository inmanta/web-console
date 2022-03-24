export interface AgentRow {
  name: string;
  last_failover?: string;
  process_id?: string;
  process_name?: string;
  unpause_on_resume?: boolean;
  paused: boolean;
  status: AgentStatus;
}

export interface Agent extends AgentRow {
  environment: string;
}

export enum AgentStatus {
  paused = "paused",
  up = "up",
  down = "down",
}

export const AgentStatusList = Object.values(AgentStatus);
