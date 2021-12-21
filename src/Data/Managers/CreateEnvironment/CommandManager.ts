import { ApiHelper, Command, CreateEnvironmentParams, Maybe } from "@/Core";
import { CommandManagerWithoutEnv } from "@/Data/Common";

export class CreateEnvironmentCommandManager extends CommandManagerWithoutEnv<"CreateEnvironment"> {
  constructor(private readonly apiHelper: ApiHelper) {
    super(
      "CreateEnvironment",
      (command) => (body) => this.submit(command, body)
    );
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
