import { CompileReport } from "@/Slices/CompileReports/Core/Domain";
import { words } from "@/UI/words";
import { deriveCompilesHealth } from "./compilesHealth";

function makeReport(overrides: Partial<CompileReport> = {}): CompileReport {
  return {
    id: "1",
    environment: "env-1",
    requested: "2021-09-09T09:00:00.000000",
    started: "2021-09-09T09:00:20.000000",
    completed: "2021-09-09T09:00:40.000000",
    success: true,
    do_export: true,
    force_update: false,
    metadata: {},
    environment_variables: {},
    version: 1,
    ...overrides,
  };
}

describe("deriveCompilesHealth", () => {
  it("is healthy with a 'succeeded' stat line when the latest compile succeeded", () => {
    const health = deriveCompilesHealth(makeReport({ success: true }));

    expect(health.status).toEqual("healthy");
    expect(health.statLines).toEqual([
      words("dashboard.environmentHealth.compiles.latestSucceeded"),
    ]);
  });

  it("is in attention with a 'failed' stat line when the latest compile failed", () => {
    const health = deriveCompilesHealth(makeReport({ success: false }));

    expect(health.status).toEqual("attention");
    expect(health.statLines).toEqual([words("dashboard.environmentHealth.compiles.latestFailed")]);
  });

  it("is in attention with a 'running' stat line when the latest compile is in progress", () => {
    const health = deriveCompilesHealth(makeReport({ completed: null }));

    expect(health.status).toEqual("attention");
    expect(health.statLines).toEqual([words("dashboard.environmentHealth.compiles.latestRunning")]);
  });

  it("is in attention with a 'none' stat line when there is no latest report", () => {
    const health = deriveCompilesHealth(undefined);

    expect(health.status).toEqual("attention");
    expect(health.statLines).toEqual([words("dashboard.environmentHealth.compiles.none")]);
  });
});
