import { ApiHelper, Command, CommandManager } from "@/Core";

export class DeleteInstanceCommandManager implements CommandManager {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly environment: string
  ) {}

  matches(command: Command.SubCommand<"DeleteInstance">): boolean {
    return command.kind === "DeleteInstance";
  }

  getTrigger({
    id,
    service_entity,
    version,
  }: Command.SubCommand<"DeleteInstance">): Command.Trigger<"DeleteInstance"> {
    return () =>
      this.apiHelper.delete(
        `/lsm/v1/service_inventory/${service_entity}/${id}?current_version=${version}`,
        this.environment
      );
  }
}
