import { Command, CommandManager, ApiHelper, Either } from "@/Core";

export class GenerateTokenCommandManager implements CommandManager {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly environment: string
  ) {}

  matches(command: Command.SubCommand<"GenerateToken">): boolean {
    return command.kind === "GenerateToken";
  }

  getTrigger(): Command.Trigger<"GenerateToken"> {
    return async (tokenInfo) =>
      Either.mapRight(
        (data) => data.data,
        await this.apiHelper.post<Command.ApiData<"GenerateToken">>(
          "/api/v2/environment_auth",
          this.environment,
          tokenInfo
        )
      );
  }
}
