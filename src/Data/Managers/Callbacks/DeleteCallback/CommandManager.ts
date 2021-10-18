import { ApiHelper, Command, CommandManager, Updater } from "@/Core";

export class DeleteCallbackCommandManager implements CommandManager {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly updater: Updater<"GetCallbacks">,
    private readonly environment: string
  ) {}

  matches(command: Command.SubCommand<"DeleteCallback">): boolean {
    return command.kind === "DeleteCallback";
  }

  getTrigger(
    command: Command.SubCommand<"DeleteCallback">
  ): Command.Trigger<"DeleteCallback"> {
    return async () => {
      const result = await this.apiHelper.delete(
        this.getUrl(command),
        this.environment
      );
      await this.updater.update({
        kind: "GetCallbacks",
        service_entity: command.service_entity,
      });
      return result;
    };
  }

  private getUrl({ callbackId }: Command.SubCommand<"DeleteCallback">): string {
    return `/lsm/v1/callbacks/${callbackId}`;
  }
}
