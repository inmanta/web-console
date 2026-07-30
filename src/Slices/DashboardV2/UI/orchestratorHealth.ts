import { ServerStatus } from "@/Core/Domain/ServerStatus";
import { words } from "@/UI/words";
import { ChecklistItem } from "./Components/EnvironmentHealth/OrchestratorCard";

export interface OrchestratorHealth {
  operational: boolean;
  checklist: ChecklistItem[];
}

const isSliceOk = (serverStatus: ServerStatus, sliceName: string): boolean =>
  serverStatus.slices.find((slice) => slice.name === sliceName)?.reported_status === "OK";

const isDatabaseConnected = (serverStatus: ServerStatus): boolean =>
  serverStatus.slices.find((slice) => slice.name === "core.database")?.status.connected === true;

/**
 * Derives the Orchestrator health card's verdict and checklist from a raw
 * useGetServerStatus() response. "Server OK" / "Scheduler running" read the generic
 * per-slice `reported_status` field; "Database connected" reads `core.database`'s more
 * specific `connected` boolean.
 */
export const deriveOrchestratorHealth = (serverStatus: ServerStatus): OrchestratorHealth => ({
  operational: serverStatus.status === "OK",
  checklist: [
    {
      label: words("dashboardV2.environmentHealth.checklist.serverOk"),
      ok: isSliceOk(serverStatus, "core.server"),
    },
    {
      label: words("dashboardV2.environmentHealth.checklist.databaseConnected"),
      ok: isDatabaseConnected(serverStatus),
    },
    {
      label: words("dashboardV2.environmentHealth.checklist.schedulerRunning"),
      ok: isSliceOk(serverStatus, "core.scheduler_manager"),
    },
  ],
});
