import { ServerStatus as ServerStatusType } from "@/Core/Domain/ServerStatus";
import { words } from "@/UI/words";
import { deriveOrchestratorHealth } from "./orchestratorHealth";

function makeServerStatus(
  overrides: Partial<ServerStatusType> = {},
  sliceOverrides: Partial<ServerStatusType["slices"][number]>[] = []
): ServerStatusType {
  const slices: ServerStatusType["slices"] = [
    { name: "core.server", status: {}, reported_status: "OK" },
    { name: "core.database", status: { connected: true }, reported_status: "OK" },
    { name: "core.scheduler_manager", status: {}, reported_status: "OK" },
  ];

  sliceOverrides.forEach((override) => {
    const slice = slices.find((candidate) => candidate.name === override.name);

    if (slice) {
      Object.assign(slice, override);
    }
  });

  return {
    product: "Inmanta Service Orchestrator",
    edition: "Standard Edition",
    version: "1.0.0",
    license: "Inmanta EULA",
    extensions: [],
    slices,
    features: [],
    status: "OK",
    python_version: "3.11.0",
    postgresql_version: "13.0",
    ...overrides,
  };
}

describe("deriveOrchestratorHealth", () => {
  it("is operational with a fully-passing checklist when everything is OK", () => {
    const health = deriveOrchestratorHealth(makeServerStatus());

    expect(health.operational).toBe(true);
    expect(health.checklist).toEqual([
      { label: words("dashboard.environmentHealth.checklist.serverOk"), ok: true },
      { label: words("dashboard.environmentHealth.checklist.databaseConnected"), ok: true },
      { label: words("dashboard.environmentHealth.checklist.schedulerRunning"), ok: true },
    ]);
  });

  it("is not operational when the overall status isn't OK", () => {
    const health = deriveOrchestratorHealth(makeServerStatus({ status: "ERROR" }));

    expect(health.operational).toBe(false);
  });

  it("flags the server checklist item when core.server isn't reported OK", () => {
    const health = deriveOrchestratorHealth(
      makeServerStatus({}, [{ name: "core.server", reported_status: "ERROR" }])
    );

    expect(health.checklist[0]).toEqual({
      label: words("dashboard.environmentHealth.checklist.serverOk"),
      ok: false,
    });
  });

  it("flags the database checklist item when core.database isn't connected", () => {
    const health = deriveOrchestratorHealth(
      makeServerStatus({}, [{ name: "core.database", status: { connected: false } }])
    );

    expect(health.checklist[1]).toEqual({
      label: words("dashboard.environmentHealth.checklist.databaseConnected"),
      ok: false,
    });
  });

  it("flags the scheduler checklist item when core.scheduler_manager isn't reported OK", () => {
    const health = deriveOrchestratorHealth(
      makeServerStatus({}, [{ name: "core.scheduler_manager", reported_status: "ERROR" }])
    );

    expect(health.checklist[2]).toEqual({
      label: words("dashboard.environmentHealth.checklist.schedulerRunning"),
      ok: false,
    });
  });
});
