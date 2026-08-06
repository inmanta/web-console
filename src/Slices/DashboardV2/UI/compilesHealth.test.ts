import { CompileStatus } from "@/Core/Domain/CompileStatus";
import { CompileReport } from "@/Slices/CompileReports/Core/Domain";
import { words } from "@/UI/words";
import { deriveCompilesHealth, getCompileStatus } from "./compilesHealth";

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

describe("getCompileStatus", () => {
  it("returns queued when the report hasn't started", () => {
    expect(getCompileStatus(makeReport({ started: null }))).toEqual(CompileStatus.queued);
  });

  it("returns inprogress when started but not completed", () => {
    expect(
      getCompileStatus(makeReport({ started: "2021-09-09T09:00:20.000000", completed: null }))
    ).toEqual(CompileStatus.inprogress);
  });

  it("returns success when completed and successful", () => {
    expect(getCompileStatus(makeReport({ success: true }))).toEqual(CompileStatus.success);
  });

  it("returns failed when completed and unsuccessful", () => {
    expect(getCompileStatus(makeReport({ success: false }))).toEqual(CompileStatus.failed);
  });
});

describe("deriveCompilesHealth", () => {
  it("is healthy with a 'succeeded' stat line when the latest compile succeeded", () => {
    const health = deriveCompilesHealth(makeReport({ success: true }));

    expect(health.status).toEqual("healthy");
    expect(health.statLines).toEqual([
      words("dashboardV2.environmentHealth.compiles.latestSucceeded"),
    ]);
  });

  it("is in attention with a 'failed' stat line when the latest compile failed", () => {
    const health = deriveCompilesHealth(makeReport({ success: false }));

    expect(health.status).toEqual("attention");
    expect(health.statLines).toEqual([
      words("dashboardV2.environmentHealth.compiles.latestFailed"),
    ]);
  });

  it("is in attention with a 'running' stat line when the latest compile is in progress", () => {
    const health = deriveCompilesHealth(makeReport({ completed: null }));

    expect(health.status).toEqual("attention");
    expect(health.statLines).toEqual([
      words("dashboardV2.environmentHealth.compiles.latestRunning"),
    ]);
  });

  it("is in attention with a 'none' stat line when there is no latest report", () => {
    const health = deriveCompilesHealth(undefined);

    expect(health.status).toEqual("attention");
    expect(health.statLines).toEqual([words("dashboardV2.environmentHealth.compiles.none")]);
  });
});
