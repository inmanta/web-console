import { ApiHelper } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export function DeleteServiceCommandManager(apiHelper: ApiHelper) {
  return CommandManagerWithEnv<"DeleteService">(
    "DeleteService",
    ({ name }, environment) => {
      return () =>
        apiHelper.delete(`/lsm/v1/service_catalog/${name}`, environment);
    }
  );
}
