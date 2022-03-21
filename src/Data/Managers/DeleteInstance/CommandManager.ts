import { ApiHelper, UpdaterWithEnv } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export class DeleteInstanceCommandManager extends CommandManagerWithEnv<"DeleteInstance"> {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly updater: UpdaterWithEnv<"GetServiceInstances">
  ) {
    super("DeleteInstance", ({ id, service_entity, version }, environment) => {
      return async (query) => {
        const result = await this.apiHelper.delete(
          `/lsm/v1/service_inventory/${service_entity}/${id}?current_version=${version}`,
          environment
        );
        await this.updater.update(query, environment);
        return result;
      };
    });
  }
}
