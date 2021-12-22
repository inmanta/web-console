import { ApiHelper } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export class RepairCommandManager extends CommandManagerWithEnv<"Repair"> {
  constructor(private readonly apiHelper: ApiHelper) {
    super("Repair", (command, environment) => {
      return (agents?: string[]) =>
        this.apiHelper.postWithoutResponse(`/api/v1/deploy`, environment, {
          agent_trigger_method: "push_full_deploy",
          agents: agents,
        });
    });
  }
}
