import { ApiHelper } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export function DestroyInstanceCommandManager(apiHelper: ApiHelper) {
  return CommandManagerWithEnv<"DestroyInstance">(
    "DestroyInstance",
    ({ id, service_entity, version }, environment) => {
      return async (refetch) => {
        const result = await apiHelper.delete(
          `/lsm/v1/service_inventory/${service_entity}/${id}/expert?current_version=${version}`,
          environment
        );
        await refetch();
        return result;
      };
    }
  );
}
