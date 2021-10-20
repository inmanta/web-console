import { ApiHelper, Command, Maybe, Putter } from "@/Core";

export class CreateEnvironmentPutter implements Putter<"CreateEnvironment"> {
  constructor(private readonly apiHelper: ApiHelper) {}

  private getUrl(): string {
    return `/api/v2/environment`;
  }

  put(
    command: Command.SubCommand<"CreateEnvironment">,
    body: Command.Body<"CreateEnvironment">
  ): Promise<Maybe.Type<Command.Error<"CreateEnvironment">>> {
    return this.apiHelper.putWithoutResponseAndEnvironment<
      Command.Body<"CreateEnvironment">
    >(this.getUrl(), body);
  }
}
