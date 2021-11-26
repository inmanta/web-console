import { Command, CommandManager, ApiHelper, Either } from "@/Core";

export class GetSupportArchiveCommandManager implements CommandManager {
  constructor(private readonly apiHelper: ApiHelper) {}

  matches(command: Command.SubCommand<"GetSupportArchive">): boolean {
    return command.kind === "GetSupportArchive";
  }

  getTrigger(): Command.Trigger<"GetSupportArchive"> {
    return async () =>
      Either.mapRight(
        (data) => data.data,
        await this.apiHelper.getWithoutEnvironment<
          Command.ApiData<"GetSupportArchive">
        >("/api/v1/support/full")
      );
  }
}
