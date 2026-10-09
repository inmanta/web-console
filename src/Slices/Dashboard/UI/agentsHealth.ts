import { words } from "@/UI/words";
import { HealthStatus } from "./Components/EnvironmentHealth/StatusIndicator";

export interface AgentsHealth {
  status: HealthStatus;
  statLines: string[];
}

/**
 * Agents health is derived from three small (pageSize-only-to-read-metadata.total)
 * useGetAgents() calls: unfiltered (total), status=down, status=paused. "Up" is total - down -
 * paused rather than its own filtered call, since the total already has to be fetched anyway and
 * this saves a fourth request. Paused agents are a deliberate user action, not a failure signal,
 * so they don't affect the status word — only a nonzero "down" count does.
 */
export const deriveAgentsHealth = (total: number, down: number, paused: number): AgentsHealth => {
  const up = total - down - paused;

  return {
    status: down > 0 ? "attention" : "healthy",
    statLines: words("dashboard.environmentHealth.agentsSummary")(total, up, down, paused),
  };
};
