import { ApiHelper } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export function UpdateCatalogCommandManager(apiHelper: ApiHelper) {
  return CommandManagerWithEnv<"UpdateCatalog">(
    "UpdateCatalog",
    (command, environment) => async () => {
      return await apiHelper.post(
        `/lsm/v1/exporter/export_service_definition`,
        environment,
        null,
      );
    },
  );
}
