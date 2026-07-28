import { CompileStatus } from "@/Core/Domain/CompileStatus";
import { CompileReport } from "@/Slices/CompileReports/Core/Domain";
import { words } from "@/UI/words";
import { HealthStatus } from "./Components/StatusIndicator";

export interface CompilesHealth {
  status: HealthStatus;
  statLine: string;
}

/**
 * Mirrors CompileReportsTablePresenter's private getStatusFromReport — there's no shared export
 * to reuse, and the derivation is a small enough branch to duplicate rather than instantiate a
 * table presenter (which needs an unrelated DatePresenter) just for this one field.
 */
export const getCompileStatus = ({ completed, success, started }: CompileReport): CompileStatus => {
  if (!started) {
    return CompileStatus.queued;
  } else if (!completed) {
    return CompileStatus.inprogress;
  } else if (success) {
    return CompileStatus.success;
  }

  return CompileStatus.failed;
};

/**
 * The Compiles health tile's status word tracks whether the LATEST compile succeeded, not the
 * historical failure count — a 7-day window with past failures can still read "Healthy" today.
 */
export const deriveCompilesHealth = (
  latestReport: CompileReport | undefined,
  failedInWindowCount: number
): CompilesHealth => {
  const latestStatus = latestReport ? getCompileStatus(latestReport) : undefined;
  const status: HealthStatus = latestStatus === CompileStatus.success ? "healthy" : "attention";

  const latestResultLabel =
    latestStatus === CompileStatus.success
      ? words("dashboardV2.environmentHealth.compiles.latestSucceeded")
      : latestStatus === CompileStatus.failed
        ? words("dashboardV2.environmentHealth.compiles.latestFailed")
        : latestStatus === CompileStatus.inprogress
          ? words("dashboardV2.environmentHealth.compiles.latestRunning")
          : words("dashboardV2.environmentHealth.compiles.none");

  return {
    status,
    statLine: `${latestResultLabel} · ${words("dashboardV2.environmentHealth.compiles.failedInWindow")(failedInWindowCount)}`,
  };
};
