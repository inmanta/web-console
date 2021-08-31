import { ApiHelper, Command, Maybe, PosterWithoutResponse } from "@/Core";

export class HaltEnvironmentPoster
  implements PosterWithoutResponse<"HaltEnvironment">
{
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly environment: string
  ) {}

  private getUrl(): string {
    return `${this.apiHelper.getBaseUrl()}/api/v2/actions/environment/halt`;
  }

  post(
    command: Command.SubCommand<"HaltEnvironment">,
    body: Command.Body<"HaltEnvironment">
  ): Promise<Maybe.Type<Command.Error<"HaltEnvironment">>> {
    return this.apiHelper.postWithoutResponse<Command.Body<"HaltEnvironment">>(
      this.getUrl(),
      this.environment,
      body
    );
  }
}
