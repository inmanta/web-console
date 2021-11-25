import { ApiHelper, Command, CommandManager } from "@/Core";

export class DeployCommandManager implements CommandManager {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly environment: string
  ) {}

  matches(command: Command.SubCommand<"Deploy">): boolean {
    return command.kind === "Deploy";
  }

  getTrigger(): Command.Trigger<"Deploy"> {
    return () =>
      this.apiHelper.postWithoutResponse(`/api/v1/deploy`, this.environment, {
        agent_trigger_method: "push_incremental_deploy",
      });
  }
}
