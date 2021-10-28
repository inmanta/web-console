import {
  Command,
  CommandManager,
  Query,
  ApiHelper,
  Maybe,
  Updater,
} from "@/Core";

export class ResetEnvironmentSettingCommandManager implements CommandManager {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly updater: Updater<"GetEnvironmentSetting">,
    private readonly environment: string
  ) {}

  getTrigger(): Command.Trigger<"ResetEnvironmentSetting"> {
    return async (id) => {
      const error = await this.apiHelper.delete(
        `/api/v2/environment_settings/${id}`,
        this.environment
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

  matches(command: Command.SubCommand<"ResetEnvironmentSetting">): boolean {
    return command.kind === "ResetEnvironmentSetting";
  }
}
