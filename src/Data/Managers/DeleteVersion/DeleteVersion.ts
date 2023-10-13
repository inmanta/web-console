import { ApiHelper } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export function DeleteVersionCommandManager(apiHelper: ApiHelper) {
  return CommandManagerWithEnv<"DeleteVersion">(
    "DeleteVersion",
    ({ version }, environment) => {
      return () => apiHelper.delete(`/api/v1/version/${version}`, environment);
    },
  );
}
