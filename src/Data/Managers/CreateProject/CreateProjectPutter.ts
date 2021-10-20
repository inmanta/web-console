import { ApiHelper, Command, Maybe, Putter } from "@/Core";

export class CreateProjectPutter implements Putter<"CreateProject"> {
  constructor(private readonly apiHelper: ApiHelper) {}

  private getUrl(): string {
    return `/api/v2/project`;
  }

  put(
    command: Command.SubCommand<"CreateProject">,
    body: Command.Body<"CreateProject">
  ): Promise<Maybe.Type<Command.Error<"CreateProject">>> {
    return this.apiHelper.putWithoutResponseAndEnvironment<
      Command.Body<"CreateProject">
    >(this.getUrl(), body);
  }
}
