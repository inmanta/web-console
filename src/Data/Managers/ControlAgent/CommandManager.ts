import { ApiHelper, UpdaterWithEnv } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export class ControlAgentCommandManager extends CommandManagerWithEnv<"ControlAgent"> {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly updater: UpdaterWithEnv<"GetAgents">
  ) {
    super("ControlAgent", ({ name, action }, environment) => {
      return async (query) => {
        const result = await this.apiHelper.postWithoutResponse(
          `/api/v2/agent/${name}/${action}`,
          environment,
          null
        );
        await this.updater.update(query, environment);
        return result;
      };
    });
  }
}
