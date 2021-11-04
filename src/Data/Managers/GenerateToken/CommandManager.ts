import { Command, CommandManager, ApiHelper } from "@/Core";

export class GenerateTokenCommandManager implements CommandManager {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly environment: string
  ) {}

  matches(command: Command.SubCommand<"GenerateToken">): boolean {
    return command.kind === "GenerateToken";
  }

  getTrigger(): Command.Trigger<"GenerateToken"> {
    return (tokenInfo) =>
      this.apiHelper.post(
        "/api/v2/environment_auth",
        this.environment,
        tokenInfo
      );
  }
}
