import { ApiHelper, Command, Poster, Either } from "@/Core";

export class PosterImpl<Kind extends Command.Kind> implements Poster<Kind> {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly environment: string,
    private readonly getUrl: (cmd: Command.SubCommand<Kind>) => string
  ) {}

  post(
    command: Command.SubCommand<Kind>,
    body: Command.Body<Kind>
  ): Promise<Either.Type<string, Command.ApiData<Kind>>> {
    return this.apiHelper.post<Command.ApiData<Kind>, Command.Body<Kind>>(
      this.getUrl(command),
      this.environment,
      body
    );
  }
}
