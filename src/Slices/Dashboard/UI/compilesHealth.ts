import { CompileStatus } from "@/Core/Domain/CompileStatus";
import { CompileReport } from "@/Slices/CompileReports/Core/Domain";
import { words } from "@/UI/words";
import { HealthStatus } from "./Components/EnvironmentHealth/StatusIndicator";

export interface CompilesHealth {
  status: HealthStatus;
  statLines: string[];
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
 * The Compiles health tile's status word and stat line both track only whether the LATEST
 * compile succeeded, failed, or is still running — no historical failure count.
 */
export const deriveCompilesHealth = (latestReport: CompileReport | undefined): CompilesHealth => {
  const latestStatus = latestReport ? getCompileStatus(latestReport) : undefined;
  const status: HealthStatus = latestStatus === CompileStatus.success ? "healthy" : "attention";

  const latestResultLabel =
    latestStatus === CompileStatus.success
      ? words("dashboard.environmentHealth.compiles.latestSucceeded")
      : latestStatus === CompileStatus.failed
        ? words("dashboard.environmentHealth.compiles.latestFailed")
        : latestStatus === CompileStatus.inprogress
          ? words("dashboard.environmentHealth.compiles.latestRunning")
          : words("dashboard.environmentHealth.compiles.none");

  return {
    status,
    statLines: [latestResultLabel],
  };
};
