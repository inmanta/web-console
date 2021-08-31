import { ApiHelper, Command, Maybe, PosterWithoutResponse } from "@/Core";

export class ResumeEnvironmentPoster
  implements PosterWithoutResponse<"ResumeEnvironment">
{
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly environment: string
  ) {}

  private getUrl(): string {
    return `${this.apiHelper.getBaseUrl()}/api/v2/actions/environment/resume`;
  }

  post(
    command: Command.SubCommand<"ResumeEnvironment">,
    body: Command.Body<"ResumeEnvironment">
  ): Promise<Maybe.Type<Command.Error<"ResumeEnvironment">>> {
    return this.apiHelper.postWithoutResponse<
      Command.Body<"ResumeEnvironment">
    >(this.getUrl(), this.environment, body);
  }
}
