import { ApiHelper } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export function DeployCommandManager(apiHelper: ApiHelper) {
  return CommandManagerWithEnv<"Deploy">("Deploy", (command, environment) => {
    return (agents?: string[]) =>
      apiHelper.postWithoutResponse(`/api/v1/deploy`, environment, {
        agent_trigger_method: "push_incremental_deploy",
        agents: agents,
      });
  });
}
