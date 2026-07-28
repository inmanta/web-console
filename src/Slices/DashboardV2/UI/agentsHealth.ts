import { words } from "@/UI/words";
import { HealthStatus } from "./Components/StatusIndicator";

export interface AgentsHealth {
  status: HealthStatus;
  statLine: string;
}

/**
 * Agents health is derived from three separate count-only useGetAgents() calls (one per
 * AgentStatus), since there's no single aggregate-by-status endpoint. Paused agents are a
 * deliberate user action, not a failure signal, so they don't affect the status word — only
 * a nonzero "down" count does.
 */
export const deriveAgentsHealth = (up: number, down: number, paused: number): AgentsHealth => ({
  status: down > 0 ? "attention" : "healthy",
  statLine: words("dashboardV2.environmentHealth.agentsSummary")(up + down + paused, up, down, paused),
});
