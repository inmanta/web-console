import { ApiHelper, Command, CommandManager } from "@/Core";

export class RepairCommandManager implements CommandManager {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly environment: string
  ) {}

  matches(command: Command.SubCommand<"Repair">): boolean {
    return command.kind === "Repair";
  }

  getTrigger(): Command.Trigger<"Repair"> {
    return () =>
      this.apiHelper.postWithoutResponse(`/api/v1/deploy`, this.environment, {
        agent_trigger_method: "push_full_deploy",
      });
  }
}
