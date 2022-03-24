import { ApiHelper } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export class DeleteInstanceCommandManager extends CommandManagerWithEnv<"DeleteInstance"> {
  constructor(private readonly apiHelper: ApiHelper) {
    super("DeleteInstance", ({ id, service_entity, version }, environment) => {
      return async (refetch) => {
        const result = await this.apiHelper.delete(
          `/lsm/v1/service_inventory/${service_entity}/${id}?current_version=${version}`,
          environment
        );
        await refetch();
        return result;
      };
    });
  }
}
