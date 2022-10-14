import { ApiHelper } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export function DeleteInstanceCommandManager(apiHelper: ApiHelper) {
  return CommandManagerWithEnv<"DeleteInstance">(
    "DeleteInstance",
    ({ id, service_entity, version }, environment) => {
      return async (refetch) => {
        const result = await apiHelper.delete(
          `/lsm/v1/service_inventory/${service_entity}/${id}?current_version=${version}`,
          environment
        );
        await refetch();
        return result;
      };
    }
  );
}
