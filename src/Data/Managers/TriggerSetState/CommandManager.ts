import { ApiHelper, AuthHelper, Command, CommandManager, Maybe } from "@/Core";

export class TriggerSetStateCommandManager implements CommandManager {
  constructor(
    private readonly authHelper: AuthHelper,
    private readonly apiHelper: ApiHelper,
    private readonly environment: string
  ) {}

  matches(command: Command.SubCommand<"TriggerSetState">): boolean {
    return command.kind === "TriggerSetState";
  }

  getTrigger(
    command: Command.SubCommand<"TriggerSetState">
  ): Command.Trigger<"TriggerSetState"> {
    return (targetState) => this.submit(command, targetState);
  }

  private async submit(
    { service_entity, id, version }: Command.SubCommand<"TriggerSetState">,
    targetState: string
  ): Promise<Maybe.Type<Command.Error<"TriggerSetState">>> {
    const userName = this.authHelper.getUsername();
    const message = userName
      ? `Triggered from the console by ${userName}`
      : "Triggered from the console";

    return await this.apiHelper.postWithoutResponse(
      `/lsm/v1/service_inventory/${service_entity}/${id}/state`,
      this.environment,
      {
        current_version: version,
        target_state: targetState,
        message,
      }
    );
  }
}
