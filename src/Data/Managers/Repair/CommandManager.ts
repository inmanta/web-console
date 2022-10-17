import { ApiHelper } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export function RepairCommandManager(apiHelper: ApiHelper) {
  return CommandManagerWithEnv<"Repair">(
    "Repair",
    (command, environment) => (agents) =>
      apiHelper.postWithoutResponse(`/api/v1/deploy`, environment, {
        agent_trigger_method: "push_full_deploy",
        agents: agents,
      })
  );
}
