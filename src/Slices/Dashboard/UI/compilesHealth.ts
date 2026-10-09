import { CompileStatus } from "@/Core/Domain/CompileStatus";
import { CompileReport } from "@/Slices/CompileReports/Core/Domain";
import { getStatusFromReport } from "@/Slices/CompileReports/UI/CompileReportsTablePresenter";
import { words } from "@/UI/words";
import { HealthStatus } from "./Components/EnvironmentHealth/StatusIndicator";

export interface CompilesHealth {
  status: HealthStatus;
  statLines: string[];
}

/**
 * The Compiles health tile's status word and stat line both track only whether the LATEST
 * compile succeeded, failed, or is still running — no historical failure count.
 */
export const deriveCompilesHealth = (latestReport: CompileReport | undefined): CompilesHealth => {
  const latestStatus = latestReport ? getStatusFromReport(latestReport) : undefined;
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
