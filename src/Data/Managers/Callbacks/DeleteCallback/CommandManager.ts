import { ApiHelper, Command, UpdaterWithEnv } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export class DeleteCallbackCommandManager extends CommandManagerWithEnv<"DeleteCallback"> {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly updater: UpdaterWithEnv<"GetCallbacks">
  ) {
    super("DeleteCallback", (command, environment) => {
      return async () => {
        const result = await this.apiHelper.delete(
          this.getUrl(command),
          environment
        );
        await this.updater.update(
          {
            kind: "GetCallbacks",
            service_entity: command.service_entity,
          },
          environment
        );
        return result;
      };
    });
  }

  private getUrl({ callbackId }: Command.SubCommand<"DeleteCallback">): string {
    return `/lsm/v1/callbacks/${callbackId}`;
  }
}
