export interface AgentProcess {
  sid: string;
  hostname: string;
  environment: string;
  first_seen?: string;
  last_seen?: string;
  expired?: string;
  state?: Record<string, unknown>;
}
