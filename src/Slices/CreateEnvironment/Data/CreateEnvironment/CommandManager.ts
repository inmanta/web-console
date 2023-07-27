import { ApiHelper, Command, Either, EnvironmentModel, Updater } from "@/Core";
import { CommandManagerWithoutEnv } from "@/Data/Common";
import { CreateEnvironmentParams } from "@S/CreateEnvironment/Core/CreateEnvironmentCommand";

export class CreateEnvironmentCommandManager extends CommandManagerWithoutEnv<"CreateEnvironment"> {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly environmentsUpdater: Updater<"GetEnvironments">,
  ) {
    super(
      "CreateEnvironment",
      (command) => (body) => this.submit(command, body),
    );
  }

  private async submit(
    command: Command.SubCommand<"CreateEnvironment">,
    body: CreateEnvironmentParams,
  ): Promise<
    Either.Type<Command.Error<"CreateEnvironment">, { data: EnvironmentModel }>
  > {
    const result = await this.apiHelper.putWithoutEnvironment<
      { data: EnvironmentModel },
      Command.Body<"CreateEnvironment">
    >(this.getUrl(), body);
    if (Either.isRight(result)) {
      await this.environmentsUpdater.update({
        kind: "GetEnvironments",
        details: false,
      });
    }
    return result;
  }

  private getUrl(): string {
    return `/api/v2/environment`;
  }
}
