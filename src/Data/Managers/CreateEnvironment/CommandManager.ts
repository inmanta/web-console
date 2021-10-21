import {
  ApiHelper,
  Command,
  CommandManager,
  CreateEnvironmentParams,
  Maybe,
} from "@/Core";

export class CreateEnvironmentCommandManager implements CommandManager {
  constructor(private readonly apiHelper: ApiHelper) {}

  matches(command: Command.SubCommand<"CreateEnvironment">): boolean {
    return command.kind === "CreateEnvironment";
  }

  getTrigger(
    command: Command.SubCommand<"CreateEnvironment">
  ): Command.Trigger<"CreateEnvironment"> {
    return (body: CreateEnvironmentParams) => this.submit(command, body);
  }

  private async submit(
    command: Command.SubCommand<"CreateEnvironment">,
    body: CreateEnvironmentParams
  ): Promise<Maybe.Type<Command.Error<"CreateEnvironment">>> {
    return this.apiHelper.putWithoutResponseAndEnvironment(this.getUrl(), body);
  }
  private getUrl(): string {
    return `/api/v2/environment`;
  }
}
