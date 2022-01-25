import { ApiHelper } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export class DeployCommandManager extends CommandManagerWithEnv<"Deploy"> {
  constructor(private readonly apiHelper: ApiHelper) {
    super("Deploy", (command, environment) => {
      return (agents?: string[]) =>
        this.apiHelper.postWithoutResponse(`/api/v1/deploy`, environment, {
          agent_trigger_method: "push_incremental_deploy",
          agents: agents,
        });
    });
  }
}
