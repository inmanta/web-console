import { ApiHelper, Command, CommandManager } from "@/Core";

export class DeleteServiceCommandManager implements CommandManager {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly environment: string
  ) {}

  matches(command: Command.SubCommand<"DeleteService">): boolean {
    return command.kind === "DeleteService";
  }

  getTrigger({
    name,
  }: Command.SubCommand<"DeleteService">): Command.Trigger<"DeleteService"> {
    return () =>
      this.apiHelper.delete(
        `/lsm/v1/service_catalog/${name}`,
        this.environment
      );
  }
}
