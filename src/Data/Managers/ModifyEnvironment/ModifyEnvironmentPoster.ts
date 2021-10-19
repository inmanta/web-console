import { ApiHelper, Command, Maybe, PosterWithoutResponse } from "@/Core";

export class ModifyEnvironmentPoster
  implements PosterWithoutResponse<"ModifyEnvironment">
{
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly environment: string
  ) {}

  private getUrl(): string {
    return `${this.apiHelper.getBaseUrl()}/api/v2/environment/${
      this.environment
    }`;
  }

  post(
    command: Command.SubCommand<"ModifyEnvironment">,
    body: Command.Body<"ModifyEnvironment">
  ): Promise<Maybe.Type<Command.Error<"ModifyEnvironment">>> {
    return this.apiHelper.postWithoutResponse<
      Command.Body<"ModifyEnvironment">
    >(this.getUrl(), this.environment, body);
  }
}
