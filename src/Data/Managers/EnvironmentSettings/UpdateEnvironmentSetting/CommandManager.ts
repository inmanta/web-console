import {
  Command,
  CommandManager,
  Query,
  ApiHelper,
  Maybe,
  Updater,
} from "@/Core";

export class UpdateEnvironmentSettingCommandManager implements CommandManager {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly updater: Updater<"GetEnvironmentSetting">,
    private readonly environment: string
  ) {}

  getTrigger(): Command.Trigger<"UpdateEnvironmentSetting"> {
    return async (id, value) => {
      const error = await this.apiHelper.postWithoutResponse(
        `/api/v2/environment_settings/${id}`,
        this.environment,
        { value }
      );

      if (Maybe.isNone(error)) {
        await this.updater.update(this.getQuery(id));
      }

      return error;
    };
  }

  private getQuery(id: string): Query.SubQuery<"GetEnvironmentSetting"> {
    return { kind: "GetEnvironmentSetting", id };
  }

  matches(command: Command.SubCommand<"UpdateEnvironmentSetting">): boolean {
    return command.kind === "UpdateEnvironmentSetting";
  }
}
