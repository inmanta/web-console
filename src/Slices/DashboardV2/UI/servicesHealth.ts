import { ServiceModel } from "@/Core/Domain/ServiceModel";
import { words } from "@/UI/words";
import { HealthStatus } from "./Components/StatusIndicator";

export interface ServicesHealth {
  status: HealthStatus;
  statLines: string[];
}

/**
 * Sums per-service instance_summary.by_label counts across all service types into a single
 * environment-wide Services health tile. useGetServiceModels() doesn't return a pre-aggregated
 * total, so this reducer does it client-side.
 */
export const aggregateServicesHealth = (models: ServiceModel[]): ServicesHealth => {
  const totals = models.reduce(
    (acc, model) => {
      const byLabel = model.instance_summary?.by_label;

      return {
        total: acc.total + Number(model.instance_summary?.total ?? 0),
        healthy: acc.healthy + Number(byLabel?.success ?? 0),
        warning: acc.warning + Number(byLabel?.warning ?? 0),
        danger: acc.danger + Number(byLabel?.danger ?? 0),
      };
    },
    { total: 0, healthy: 0, warning: 0, danger: 0 }
  );

  const status: HealthStatus =
    totals.danger > 0 ? "danger" : totals.warning > 0 ? "attention" : "healthy";

  return {
    status,
    statLines: words("dashboardV2.environmentHealth.servicesSummary")(
      totals.total,
      totals.healthy,
      totals.warning,
      totals.danger
    ),
  };
};
