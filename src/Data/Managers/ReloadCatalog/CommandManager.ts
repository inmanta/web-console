import { ApiHelper } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export function ReloadCatalogCommandManager(apiHelper: ApiHelper) {
  return CommandManagerWithEnv<"ReloadCatalog">(
    "ReloadCatalog",
    (command, environment) => async () => {
      return await apiHelper.post(
        `/lsm/v1/exporter/export_service_definition`,
        environment,
        null
      );
    }
  );
}
