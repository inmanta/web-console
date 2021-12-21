import { ApiHelper, Command, CommandManager, UpdaterWithEnv } from "@/Core";

export class DeleteCallbackCommandManager implements CommandManager {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly updater: UpdaterWithEnv<"GetCallbacks">,
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
      await this.updater.update(
        {
          kind: "GetCallbacks",
          service_entity: command.service_entity,
        },
        this.environment
      );
      return result;
    };
  }

  private getUrl({ callbackId }: Command.SubCommand<"DeleteCallback">): string {
    return `/lsm/v1/callbacks/${callbackId}`;
  }
}
