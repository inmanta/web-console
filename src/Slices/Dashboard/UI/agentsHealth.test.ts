import { words } from "@/UI/words";
import { deriveAgentsHealth } from "./agentsHealth";

describe("deriveAgentsHealth", () => {
  it("is healthy when no agents are down, deriving 'up' as total minus down minus paused", () => {
    const health = deriveAgentsHealth(10, 0, 2);

    expect(health.status).toEqual("healthy");
    expect(health.statLines).toEqual(
      words("dashboard.environmentHealth.agentsSummary")(10, 8, 0, 2)
    );
  });

  it("is in attention when at least one agent is down", () => {
    const health = deriveAgentsHealth(10, 1, 2);

    expect(health.status).toEqual("attention");
    expect(health.statLines).toEqual(
      words("dashboard.environmentHealth.agentsSummary")(10, 7, 1, 2)
    );
  });

  it("doesn't treat paused agents as a failure signal on their own", () => {
    const health = deriveAgentsHealth(5, 0, 5);

    expect(health.status).toEqual("healthy");
    expect(health.statLines).toEqual(
      words("dashboard.environmentHealth.agentsSummary")(5, 0, 0, 5)
    );
  });
});
