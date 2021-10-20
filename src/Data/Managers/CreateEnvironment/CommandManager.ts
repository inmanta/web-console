import {
  Command,
  CommandManager,
  CreateEnvironmentParams,
  Maybe,
  Putter,
} from "@/Core";

export class CreateEnvironmentCommandManager implements CommandManager {
  constructor(private readonly putter: Putter<"CreateEnvironment">) {}

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
    return this.putter.put(command, body);
  }
}
